import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/audit';

/**
 * GET /api/admin/users - List all users (Admins & Super Admins)
 * PUT /api/admin/users - Modify user role flags (Super Admins ONLY)
 * DELETE /api/admin/users - Delete user profile (Super Admins ONLY)
 */

export async function GET() {
  try {
    const userResult = await getCurrentUser();
    if (userResult.error || !userResult.profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const supabase = await getSupabase();
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const userResult = await getCurrentUser();
    if (userResult.error || !userResult.profile?.is_super_admin) {
      return NextResponse.json({ error: 'Unauthorized. Super Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, is_admin, is_super_admin } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = await getSupabase();
    
    // Fetch the target user details before updating for logging
    const { data: targetUser } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', id)
      .single();
    const targetName = targetUser ? targetUser.full_name : 'Unknown';

    const { data, error } = await supabase
      .from('users')
      .update({ is_admin, is_super_admin })
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ 
        error: 'Update failed. The user profile could not be updated. Please ensure you have RLS "UPDATE" permissions enabled for the users table in your Supabase Dashboard.' 
      }, { status: 400 });
    }

    // Log the audit event
    await logAdminAction(
      supabase,
      userResult.user.id,
      'UPDATE_USER_ROLE',
      'USER',
      id,
      `Super Admin "${userResult.profile.full_name}" updated privileges for user "${targetName}": is_admin=${!!is_admin}, is_super_admin=${!!is_super_admin}.`
    );

    return NextResponse.json({ user: data[0] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const userResult = await getCurrentUser();
    if (userResult.error || !userResult.profile?.is_super_admin) {
      return NextResponse.json({ error: 'Unauthorized. Super Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent deleting oneself
    if (id === userResult.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own super admin profile' }, { status: 400 });
    }

    const supabase = await getSupabase();
    
    // Fetch user details before deleting for logging
    const { data: targetUser } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', id)
      .single();
    const targetName = targetUser ? targetUser.full_name : 'Unknown';

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log the audit event
    await logAdminAction(
      supabase,
      userResult.user.id,
      'DELETE_USER',
      'USER',
      id,
      `Super Admin "${userResult.profile.full_name}" deleted user profile for "${targetName}".`
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
