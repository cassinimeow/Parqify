import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

/**
 * GET /api/user/sessions
 * Returns all active sessions for the currently logged-in user.
 */
export async function GET(request) {
  try {
    const supabase = await getSupabase();
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update current session's user agent with the actual browser's user-agent
    const userAgent = request.headers.get('user-agent');
    if (userAgent) {
      await supabase.rpc('update_current_session_user_agent', { 
        browser_user_agent: userAgent 
      });
    }

    // Fetch user sessions via RPC
    const { data: sessions, error: rpcError } = await supabase.rpc('get_user_sessions');
    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    return NextResponse.json({ sessions: sessions || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/user/sessions
 * Revokes a specific active session for the currently logged-in user.
 */
export async function DELETE(request) {
  try {
    const supabase = await getSupabase();
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve target session ID from query params
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Revoke the session via RPC
    const { data: success, error: rpcError } = await supabase.rpc('revoke_user_session', { 
      target_session_id: sessionId 
    });

    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    if (!success) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Session revoked successfully' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
