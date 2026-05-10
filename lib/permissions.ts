export interface PermissionSet {
  update_audit:   boolean;
  send_messages:  boolean;
  send_email:     boolean;
  update_memory:  boolean;
  trigger_sync:   boolean;
  product_search: boolean;
  send_telegram:  boolean;
}

export const DEFAULT_PERMISSIONS: Record<string, PermissionSet> = {
  yassin:  { update_audit: true,  send_messages: true,  send_email: true,  update_memory: true,  trigger_sync: true,  product_search: true,  send_telegram: true  },
  dina:    { update_audit: true,  send_messages: true,  send_email: true,  update_memory: false, trigger_sync: false, product_search: true,  send_telegram: true  },
  haitham: { update_audit: false, send_messages: true,  send_email: false, update_memory: false, trigger_sync: false, product_search: true,  send_telegram: false },
  shahd:   { update_audit: false, send_messages: true,  send_email: false, update_memory: false, trigger_sync: false, product_search: true,  send_telegram: false },
  sara:    { update_audit: true,  send_messages: true,  send_email: true,  update_memory: false, trigger_sync: false, product_search: true,  send_telegram: true  },
  shahdm:  { update_audit: false, send_messages: true,  send_email: false, update_memory: false, trigger_sync: false, product_search: true,  send_telegram: false },
  yousef:  { update_audit: false, send_messages: true,  send_email: false, update_memory: false, trigger_sync: false, product_search: true,  send_telegram: false },
  ahmed:   { update_audit: true,  send_messages: true,  send_email: true,  update_memory: false, trigger_sync: false, product_search: true,  send_telegram: true  },
};
