import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/audit';

/**
 * GET /api/admin/audit-logs
 * Retrieves all privilege audit logs. (Admins & Super Admins ONLY)
 */
export async function GET() {
  try {
    const userResult = await getCurrentUser();
    if (userResult.error || !userResult.profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const supabase = await getSupabase();
    
    // Fetch logs and join user data for actor representation
    const { data: auditLogs, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        users:admin_id (
          full_name,
          is_admin,
          is_super_admin
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ auditLogs });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/audit-logs
 * Logs a client-side reporting action (CSV export, PDF print) executed by an admin.
 */
export async function POST(request) {
  try {
    const userResult = await getCurrentUser();
    if (userResult.error || !userResult.profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { action, target_type, target_id, details } = body;

    if (!action || !target_type) {
      return NextResponse.json({ error: 'Action and target_type are required' }, { status: 400 });
    }

    const supabase = await getSupabase();
    
    await logAdminAction(
      supabase,
      userResult.user.id,
      action,
      target_type,
      target_id,
      details
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
