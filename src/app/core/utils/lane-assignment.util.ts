import { WorkOrderDocument } from '../models/work-order.model';

/**
 * Assigns lanes to work orders to prevent visual overlap
 * Work orders that overlap in time will be placed in different lanes
 */
export interface WorkOrderWithLane extends WorkOrderDocument {
  lane: number;
}

/**
 * Check if two date ranges overlap
 */
function datesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = new Date(start1).getTime();
  // Add 24 hours to end dates to make them inclusive
  const e1 = new Date(end1).getTime() + (24 * 60 * 60 * 1000);
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime() + (24 * 60 * 60 * 1000);
  
  return s1 < e2 && s2 < e1;
}

/**
 * Assign lanes to work orders for a single work center
 * Uses a greedy algorithm to minimize the number of lanes needed
 */
export function assignLanesToWorkOrders(workOrders: WorkOrderDocument[]): WorkOrderWithLane[] {
  if (workOrders.length === 0) return [];
  
  // Sort by start date
  const sorted = [...workOrders].sort((a, b) => 
    new Date(a.data.startDate).getTime() - new Date(b.data.startDate).getTime()
  );
  
  const lanes: WorkOrderWithLane[][] = [];
  const result: WorkOrderWithLane[] = [];
  
  for (const order of sorted) {
    let assignedLane = -1;
    
    // Try to find an existing lane where this order fits
    for (let i = 0; i < lanes.length; i++) {
      const lane = lanes[i];
      const lastOrderInLane = lane[lane.length - 1];
      
      // Check if this order overlaps with the last order in this lane
      if (!datesOverlap(
        order.data.startDate,
        order.data.endDate,
        lastOrderInLane.data.startDate,
        lastOrderInLane.data.endDate
      )) {
        // No overlap, can use this lane
        assignedLane = i;
        break;
      }
    }
    
    // If no suitable lane found, create a new one
    if (assignedLane === -1) {
      assignedLane = lanes.length;
      lanes.push([]);
    }
    
    // Assign the order to the lane
    const orderWithLane: WorkOrderWithLane = {
      ...order,
      lane: assignedLane
    };
    
    lanes[assignedLane].push(orderWithLane);
    result.push(orderWithLane);
  }
  
  return result;
}

/**
 * Group work orders by work center and assign lanes
 */
export function assignLanesByWorkCenter(workOrders: WorkOrderDocument[]): Map<string, WorkOrderWithLane[]> {
  const byWorkCenter = new Map<string, WorkOrderDocument[]>();
  
  // Group by work center
  for (const order of workOrders) {
    const wcId = order.data.workCenterId;
    if (!byWorkCenter.has(wcId)) {
      byWorkCenter.set(wcId, []);
    }
    byWorkCenter.get(wcId)!.push(order);
  }
  
  // Assign lanes for each work center
  const result = new Map<string, WorkOrderWithLane[]>();
  for (const [wcId, orders] of byWorkCenter.entries()) {
    result.set(wcId, assignLanesToWorkOrders(orders));
  }
  
  return result;
}

/**
 * Calculate the number of lanes needed for a work center
 */
export function getLaneCount(workOrders: WorkOrderWithLane[]): number {
  if (workOrders.length === 0) return 1;
  return Math.max(...workOrders.map(wo => wo.lane)) + 1;
}
