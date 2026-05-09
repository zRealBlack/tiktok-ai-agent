export interface PermissionSet {
  update_audit:  boolean;
  send_messages: boolean;
  send_email:    boolean;
  update_memory: boolean;
  trigger_sync:  boolean;
}

export const DEFAULT_PERMISSIONS: Record<string, PermissionSet> = {
  yassin:  { update_audit: true,  send_messages: true,  send_email: true,  update_memory: true,  trigger_sync: true  },
  dina:    { update_audit: true,  send_messages: true,  send_email: true,  update_memory: false, trigger_sync: false },
  haitham: { update_audit: false, send_messages: true,  send_email: false, update_memory: false, trigger_sync: false },
  shahd:   { update_audit: false, send_messages: true,  send_email: false, update_memory: false, trigger_sync: false },
  sara:    { update_audit: true,  send_messages: true,  send_email: true,  update_memory: false, trigger_sync: false },
  shahdm:  { update_audit: false, send_messages: true,  send_email: false, update_memory: false, trigger_sync: false },
  yousef:  { update_audit: false, send_messages: true,  send_email: false, update_memory: false, trigger_sync: false },
};
