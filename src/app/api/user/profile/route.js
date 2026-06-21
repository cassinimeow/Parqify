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

    const supabase = await getSupabase();
    
    let finalAvatarUrl = undefined;

    if (avatar_base64 && avatar_ext) {
      try {
        const base64Data = avatar_base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        
        // 1. Enforce max 5 MB size limit
        if (buffer.length > 5 * 1024 * 1024) {
          return NextResponse.json({ error: 'Image size exceeds the 5 MB limit.' }, { status: 400 });
        }

        // 2. Validate image signature (magic numbers) to verify MIME and sanitize extension
        let detected = null;
        if (buffer.length >= 4) {
          if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
            detected = { mime: 'image/jpeg', ext: 'jpg' };
          } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
            detected = { mime: 'image/png', ext: 'png' };
          } else if (
            buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && // RIFF
            buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50   // WEBP
          ) {
            detected = { mime: 'image/webp', ext: 'webp' };
          }
        }

        if (!detected) {
          return NextResponse.json({ error: 'Invalid file format. Only JPEG, PNG, and WebP images are allowed.' }, { status: 400 });
        }

        const fileName = `${user.id}-${Math.random()}.${detected.ext}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, buffer, {
            contentType: detected.mime,
          });
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        finalAvatarUrl = publicUrlData.publicUrl;
      } catch (uploadErr) {
        return NextResponse.json({ error: uploadErr.message || 'Failed to upload image' }, { status: 500 });
      }
    }

    if (full_name !== undefined) {
      // Validate full name format (only letters, spaces, dots, hyphens, and Filipino letters ñ/Ñ)
      const nameRegex = /^[a-zA-ZñÑ\s.\-]+$/;
      if (!nameRegex.test(full_name)) {
        return NextResponse.json(
          { error: 'Full name cannot contain numbers or special characters' },
          { status: 400 }
        );
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
