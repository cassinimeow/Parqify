/**
 * Shared helper for writing entries to public.audit_logs.
 * 
 * @param {object} supabase - Supabase client instance (server-side context)
 * @param {string} adminId - UUID of the admin user executing the action
 * @param {string} action - The action key (e.g. 'ADD_PARKING_LOT', 'UPDATE_USER_ROLE')
 * @param {string} targetType - Type of target resource ('LOT', 'SLOT', 'USER', 'TICKET', 'REPORT')
 * @param {string|null} targetId - UUID or unique ID of the target resource
 * @param {string|null} details - Narrative explanation of the action details
 */
export async function logAdminAction(supabase, adminId, action, targetType, targetId, details) {
  try {
    if (!adminId) {
      console.warn('Skipping audit logging: adminId is null or undefined.');
      return;
    }

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        admin_id: adminId,
        action,
        target_type: targetType,
        target_id: targetId ? String(targetId) : null,
        details: details || null
      });

    if (error) {
      console.error('Error inserting log into audit_logs table:', error.message);
    }
  } catch (err) {
    console.error('Exception raised in logAdminAction:', err);
  }
}
