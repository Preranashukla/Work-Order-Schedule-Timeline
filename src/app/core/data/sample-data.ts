import { WorkCenterDocument } from '../models/work-center.model';
import { WorkOrderDocument, WorkOrderStatus } from '../models/work-order.model';

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
 * Generate large dataset of work orders for performance testing
 * Creates 10,000 work orders with some overlapping to test z-index ordering
 */
function generateLargeDataset(): WorkOrderDocument[] {
  const workOrders: WorkOrderDocument[] = [];
  const statuses: WorkOrderStatus[] = ['open', 'in-progress', 'complete', 'blocked'];
  const workCenterIds = SAMPLE_WORK_CENTERS.map(wc => wc.docId);
  
  const productNames = [
    'Steel Tubing', 'Aluminum Frame', 'Precision Gear', 'Motor Housing',
    'Widget Assembly', 'Component Set', 'QC Inspection', 'Shipping Prep',
    'Export Package', 'Custom Order', 'Batch Production', 'Test Run',
    'Prototype Build', 'Final Assembly', 'Quality Check', 'Packaging',
    'Machining Job', 'Welding Task', 'Coating Process', 'Heat Treatment'
  ];

  // Generate 10,000 work orders
  for (let i = 0; i < 10000; i++) {
    const workCenterId = workCenterIds[i % workCenterIds.length];
    const status = statuses[i % statuses.length];
    const productName = productNames[i % productNames.length];
    
    // Create varied date ranges
    // Some will overlap intentionally to test z-index
    let startOffset: number;
    let duration: number;
    
    if (i % 10 === 0) {
      // Every 10th order: create overlapping orders (same start date range)
      startOffset = Math.floor(i / 10) % 60 - 30; // -30 to +30 days
      duration = 3 + (i % 5); // 3-7 days
    } else if (i % 7 === 0) {
      // Every 7th order: longer duration orders
      startOffset = (i % 90) - 45; // -45 to +45 days
      duration = 10 + (i % 10); // 10-19 days
    } else {
      // Regular orders: distributed across timeline
      startOffset = (i % 120) - 60; // -60 to +60 days
      duration = 2 + (i % 8); // 2-9 days
    }

    const startDate = getDateString(startOffset);
    const endDate = getDateString(startOffset + duration);

    workOrders.push({
      docId: `wo-${String(i + 1).padStart(5, '0')}`,
      docType: 'workOrder',
      data: {
        name: `${productName} #${String(i + 1).padStart(5, '0')}`,
        workCenterId,
        status,
        startDate,
        endDate
      }
    });
  }

  return workOrders;
}

/**
 * Sample Work Orders - Large dataset for performance testing
 * - 10,000 work orders
 * - Distributed across 5 work centers
 * - All 4 status types represented
 * - Includes overlapping orders to test z-index ordering
 * - Various date ranges spanning 120 days (-60 to +60 from today)
 */
export const SAMPLE_WORK_ORDERS: WorkOrderDocument[] = generateLargeDataset();

/**
 * Small sample dataset for development/testing
 * Uncomment to use a smaller dataset during development
 */
// export const SAMPLE_WORK_ORDERS: WorkOrderDocument[] = [
//   {
//     docId: 'wo-002',
//     docType: 'workOrder',
//     data: {
//       name: 'Steel Tubing Run #892',
//       workCenterId: 'wc-001',
//       status: 'in-progress',
//       startDate: getDateString(-2),
//       endDate: getDateString(5)
//     }
//   },
//   {
//     docId: 'wo-003',
//     docType: 'workOrder',
//     data: {
//       name: 'Precision Gear Set #456',
//       workCenterId: 'wc-002',
//       status: 'open',
//       startDate: getDateString(2),
//       endDate: getDateString(8)
//     }
//   },
//   {
//     docId: 'wo-004',
//     docType: 'workOrder',
//     data: {
//       name: 'Motor Housing #789',
//       workCenterId: 'wc-002',
//       status: 'blocked',
//       startDate: getDateString(-7),
//       endDate: getDateString(-1)
//     }
//   },
//   {
//     docId: 'wo-005',
//     docType: 'workOrder',
//     data: {
//       name: 'Widget Assembly A-100',
//       workCenterId: 'wc-003',
//       status: 'complete',
//       startDate: getDateString(-14),
//       endDate: getDateString(-10)
//     }
//   },
//   {
//     docId: 'wo-008',
//     docType: 'workOrder',
//     data: {
//       name: 'QC Inspection Batch #567',
//       workCenterId: 'wc-004',
//       status: 'in-progress',
//       startDate: getDateString(-1),
//       endDate: getDateString(3)
//     }
//   },
//   {
//     docId: 'wo-009',
//     docType: 'workOrder',
//     data: {
//       name: 'Shipping Prep Order #1001',
//       workCenterId: 'wc-005',
//       status: 'blocked',
//       startDate: getDateString(0),
//       endDate: getDateString(4)
//     }
//   },
//   {
//     docId: 'wo-010',
//     docType: 'workOrder',
//     data: {
//       name: 'Export Package #1002',
//       workCenterId: 'wc-005',
//       status: 'open',
//       startDate: getDateString(6),
//       endDate: getDateString(10)
//     }
//   }
// ];
