import { WorkCenterDocument } from '../models/work-center.model';
import { WorkOrderDocument } from '../models/work-order.model';

/**
 * Sample Work Centers - 5 realistic manufacturing work centers
 */
export const SAMPLE_WORK_CENTERS: WorkCenterDocument[] = [
  {
    docId: 'wc-001',
    docType: 'workCenter',
    data: {
      name: 'Extrusion Line A'
    }
  },
  {
    docId: 'wc-002',
    docType: 'workCenter',
    data: {
      name: 'CNC Machine 1'
    }
  },
  {
    docId: 'wc-003',
    docType: 'workCenter',
    data: {
      name: 'Assembly Station'
    }
  },
  {
    docId: 'wc-004',
    docType: 'workCenter',
    data: {
      name: 'Quality Control'
    }
  },
  {
    docId: 'wc-005',
    docType: 'workCenter',
    data: {
      name: 'Packaging Line'
    }
  }
];

/**
 * Helper function to get date string relative to today
 * @param daysOffset - Number of days from today (negative for past, positive for future)
 */
function getDateString(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

/**
 * Sample Work Orders - 10 work orders demonstrating all features:
 * - All 4 status types represented
 * - Multiple orders on same work center (non-overlapping)
 * - Various date ranges
 */
export const SAMPLE_WORK_ORDERS: WorkOrderDocument[] = [
  // Extrusion Line A - 2 orders (demonstrating multiple on same center)
  {
    docId: 'wo-001',
    docType: 'workOrder',
    data: {
      name: 'Aluminum Profile Batch #1247',
      workCenterId: 'wc-001',
      status: 'complete',
      startDate: getDateString(-10),
      endDate: getDateString(-5)
    }
  },
  {
    docId: 'wo-002',
    docType: 'workOrder',
    data: {
      name: 'Steel Tubing Run #892',
      workCenterId: 'wc-001',
      status: 'in-progress',
      startDate: getDateString(-2),
      endDate: getDateString(5)
    }
  },

  // CNC Machine 1 - 2 orders
  {
    docId: 'wo-003',
    docType: 'workOrder',
    data: {
      name: 'Precision Gear Set #456',
      workCenterId: 'wc-002',
      status: 'open',
      startDate: getDateString(2),
      endDate: getDateString(8)
    }
  },
  {
    docId: 'wo-004',
    docType: 'workOrder',
    data: {
      name: 'Motor Housing #789',
      workCenterId: 'wc-002',
      status: 'blocked',
      startDate: getDateString(-7),
      endDate: getDateString(-1)
    }
  },

  // Assembly Station - 3 orders (demonstrating multiple non-overlapping)
  {
    docId: 'wo-005',
    docType: 'workOrder',
    data: {
      name: 'Widget Assembly A-100',
      workCenterId: 'wc-003',
      status: 'complete',
      startDate: getDateString(-14),
      endDate: getDateString(-10)
    }
  },
  {
    docId: 'wo-006',
    docType: 'workOrder',
    data: {
      name: 'Component Kit B-200',
      workCenterId: 'wc-003',
      status: 'in-progress',
      startDate: getDateString(-3),
      endDate: getDateString(2)
    }
  },
  {
    docId: 'wo-007',
    docType: 'workOrder',
    data: {
      name: 'Final Assembly C-300',
      workCenterId: 'wc-003',
      status: 'open',
      startDate: getDateString(4),
      endDate: getDateString(12)
    }
  },

  // Quality Control - 1 order
  {
    docId: 'wo-008',
    docType: 'workOrder',
    data: {
      name: 'QC Inspection Batch #567',
      workCenterId: 'wc-004',
      status: 'in-progress',
      startDate: getDateString(-1),
      endDate: getDateString(3)
    }
  },

  // Packaging Line - 2 orders
  {
    docId: 'wo-009',
    docType: 'workOrder',
    data: {
      name: 'Shipping Prep Order #1001',
      workCenterId: 'wc-005',
      status: 'blocked',
      startDate: getDateString(0),
      endDate: getDateString(4)
    }
  },
  {
    docId: 'wo-010',
    docType: 'workOrder',
    data: {
      name: 'Export Package #1002',
      workCenterId: 'wc-005',
      status: 'open',
      startDate: getDateString(6),
      endDate: getDateString(10)
    }
  }
];
