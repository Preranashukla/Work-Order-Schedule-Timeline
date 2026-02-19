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
  const dateStr = date.toISOString().split('T')[0];
  
  // Debug: Log the first few dates to verify
  if (daysOffset === -45 || daysOffset === 0 || daysOffset === 45) {
    console.log(`📆 Work Order Date (offset ${daysOffset}):`, dateStr);
  }
  
  return dateStr;
}

/**
 * Generate dataset of work orders with overlapping for testing
 * Creates realistic number of orders with intentional overlaps to test z-index ordering
 */
function generateDataset(): WorkOrderDocument[] {
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

  // Generate 1,000 work orders - optimal balance between testing and performance
  for (let i = 0; i < 10; i++) {
    const workCenterId = workCenterIds[i % workCenterIds.length];
    const status = statuses[i % statuses.length];
    const productName = productNames[i % productNames.length];
    
    // Create varied date ranges with intentional overlaps
    let startOffset: number;
    let duration: number;
    
    if (i % 8 === 0) {
      // Every 8th order: create overlapping orders (same start date range)
      startOffset = Math.floor(i / 8) % 40 - 20; // -20 to +20 days
      duration = 5 + (i % 4); // 5-8 days
    } else if (i % 5 === 0) {
      // Every 5th order: longer duration orders that will overlap
      startOffset = (i % 60) - 30; // -30 to +30 days
      duration = 12 + (i % 8); // 12-19 days
    } else {
      // Regular orders: distributed across timeline
      startOffset = (i % 90) - 45; // -45 to +45 days
      duration = 3 + (i % 7); // 3-9 days
    }

    const startDate = getDateString(startOffset);
    const endDate = getDateString(startOffset + duration);

    // Add dependency to previous order occasionally
    const dependsOnWorkOrderIds: string[] = [];
    if (i > 0 && i % 5 === 0) {
      const prevOrder = workOrders[i - 1];
      if (prevOrder) {
        dependsOnWorkOrderIds.push(prevOrder.docId);
      }
    }

    workOrders.push({
      docId: `wo-${String(i + 1).padStart(5, '0')}`,
      docType: 'workOrder',
      data: {
        name: `${productName} #${String(i + 1).padStart(5, '0')}`,
        workCenterId,
        status,
        startDate,
        endDate,
        dependsOnWorkOrderIds
      }
    });
  }

  return workOrders;
}

/**
 * Sample Work Orders - Large dataset for performance testing
 * - 1,000 work orders (200 per work center)
 * - Distributed across 5 work centers
 * - All 4 status types represented
 * - Includes overlapping orders to test z-index ordering
 * - Various date ranges spanning 90 days (-45 to +45 from today)
 * 
 * Memoized: Generated once and cached for performance
 * Note: 1,000 orders provides excellent testing while maintaining smooth performance
 */
let _cachedWorkOrders: WorkOrderDocument[] | null = null;

export const SAMPLE_WORK_ORDERS: WorkOrderDocument[] = (() => {
  if (!_cachedWorkOrders) {
    console.time('⏱️ Dataset generation');
    _cachedWorkOrders = generateDataset();
    console.timeEnd('⏱️ Dataset generation');
    console.log(`📊 Generated ${_cachedWorkOrders.length} work orders`);
  }
  return _cachedWorkOrders;
})();

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
