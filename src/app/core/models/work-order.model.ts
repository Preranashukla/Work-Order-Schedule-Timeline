/**
 * Work Order Status Types
 * - open: Default status on creation (Blue)
 * - in-progress: Work has started (Blue/Purple)
 * - complete: Work finished (Green)
 * - blocked: Work is blocked (Yellow/Orange)
 */
export type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';

/**
 * Work Order Document - Represents a scheduled work order on a work center.
 */
export interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string;
    status: WorkOrderStatus;
    startDate: string;   // ISO format "YYYY-MM-DD"
    endDate: string;     // ISO format "YYYY-MM-DD"
  };
}

/**
 * Status display configuration for UI rendering
 */
export interface StatusConfig {
  label: string;
  value: WorkOrderStatus;
  color: string;
  bgColor: string;
}

/**
 * Map of status configurations for quick lookup
 */
export const STATUS_CONFIG: Record<WorkOrderStatus, StatusConfig> = {
  'open': {
    label: 'Open',
    value: 'open',
    color: '#5659FF',
    bgColor: '#EEEEFF'
  },
  'in-progress': {
    label: 'In Progress',
    value: 'in-progress',
    color: '#7C4DFF',
    bgColor: '#F3EEFF'
  },
  'complete': {
    label: 'Complete',
    value: 'complete',
    color: '#34A853',
    bgColor: '#E6F4EA'
  },
  'blocked': {
    label: 'Blocked',
    value: 'blocked',
    color: '#F29D0A',
    bgColor: '#FEF3E0'
  }
};
