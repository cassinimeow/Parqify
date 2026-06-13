import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

/**
 * POST /api/user/profile
 * Updates the user's full_name and/or avatar_url in the public.users table.
 * Body: { full_name?: string, avatar_url?: string }
 */
export async function POST(request) {
  try {
    const { full_name, avatar_base64, avatar_ext } = await request.json();

    const { user, profile, error: authError } = await getCurrentUser();
    
    if (authError || !user || !profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase();
    
    let finalAvatarUrl = undefined;

    if (avatar_base64 && avatar_ext) {
      try {
        const base64Data = avatar_base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `${user.id}-${Math.random()}.${avatar_ext}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, buffer, {
            contentType: `image/${avatar_ext}`,
          });
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        finalAvatarUrl = publicUrlData.publicUrl;
      } catch (uploadErr) {
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }
    }

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (finalAvatarUrl !== undefined) updates.avatar_url = finalAvatarUrl;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No changes provided' });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Profile updated successfully', profile: data });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
