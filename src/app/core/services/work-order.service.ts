import { Injectable, signal, computed } from '@angular/core';
import { WorkOrderDocument, WorkOrderStatus } from '../models/work-order.model';
import { SAMPLE_WORK_ORDERS } from '../data/sample-data';

/**
 * Service for managing work order data.
 * Handles CRUD operations and overlap detection.
 */
@Injectable({
  providedIn: 'root'
})
export class WorkOrderService {
  /** Storage key for localStorage persistence (bonus feature) */
  private readonly STORAGE_KEY = 'work-orders';

  /** Reactive signal holding all work orders */
  private readonly _workOrders = signal<WorkOrderDocument[]>(this.loadFromStorage());

  /** Public readonly computed signal for work orders */
  readonly workOrders = computed(() => this._workOrders());

  /**
   * Load work orders from localStorage, falling back to sample data on first run.
   * Any user changes (create/edit/delete) are persisted across page refreshes.
   */
  private loadFromStorage(): WorkOrderDocument[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const orders: WorkOrderDocument[] = JSON.parse(stored);
        console.log(`✅ Restored ${orders.length} work orders from localStorage`);
        return orders;
      }
    } catch (e) {
      console.warn('Failed to parse localStorage, falling back to sample data:', e);
    }

    // First run — seed from sample data and persist
    const orders = [...SAMPLE_WORK_ORDERS];
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('Could not write to localStorage:', e);
    }
    console.log(`📦 Seeded ${orders.length} sample work orders`);
    return orders;
  }

  /**
   * Save work orders to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._workOrders()));
    } catch (e) {
      console.warn('Failed to save work orders to localStorage:', e);
    }
  }

  /**
   * Get work orders for a specific work center
   */
  getWorkOrdersByWorkCenter(workCenterId: string): WorkOrderDocument[] {
    return this._workOrders().filter(wo => wo.data.workCenterId === workCenterId);
  }

  /**
   * Get a work order by its document ID
   */
  getWorkOrderById(docId: string): WorkOrderDocument | undefined {
    return this._workOrders().find(wo => wo.docId === docId);
  }

  /**
   * Check if a work order overlaps with existing orders on the same work center.
   * 
   * Two date ranges overlap if: !(endA < startB || startA > endB)
   * Which simplifies to: startA <= endB && endA >= startB
   * 
   * @param workCenterId - The work center to check
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @param excludeId - Optional work order ID to exclude (for edit mode)
   * @returns true if there's an overlap, false otherwise
   */
  checkOverlap(
    workCenterId: string,
    startDate: string,
    endDate: string,
    excludeId?: string
  ): boolean {
    const existingOrders = this.getWorkOrdersByWorkCenter(workCenterId)
      .filter(wo => wo.docId !== excludeId);

    const newStart = new Date(startDate).getTime();
    const newEnd = new Date(endDate).getTime();

    return existingOrders.some(wo => {
      const existingStart = new Date(wo.data.startDate).getTime();
      const existingEnd = new Date(wo.data.endDate).getTime();
      
      // Check for overlap: ranges overlap if start <= otherEnd AND end >= otherStart
      return newStart <= existingEnd && newEnd >= existingStart;
    });
  }

  /**
   * Create a new work order
   * @returns The created work order or null if overlap detected
   */
  createWorkOrder(data: {
    name: string;
    workCenterId: string;
    status: WorkOrderStatus;
    startDate: string;
    endDate: string;
  }): WorkOrderDocument | null {
    // Check for overlap
    if (this.checkOverlap(data.workCenterId, data.startDate, data.endDate)) {
      return null;
    }

    const newWorkOrder: WorkOrderDocument = {
      docId: `wo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      docType: 'workOrder',
      data: { ...data }
    };

    this._workOrders.update(orders => [...orders, newWorkOrder]);
    this.saveToStorage();
    
    return newWorkOrder;
  }

  /**
   * Update an existing work order
   * @returns The updated work order or null if overlap detected
   */
  updateWorkOrder(
    docId: string,
    data: {
      name: string;
      workCenterId: string;
      status: WorkOrderStatus;
      startDate: string;
      endDate: string;
    }
  ): WorkOrderDocument | null {
    // Check for overlap (excluding current order)
    if (this.checkOverlap(data.workCenterId, data.startDate, data.endDate, docId)) {
      return null;
    }

    let updatedOrder: WorkOrderDocument | null = null;

    this._workOrders.update(orders => 
      orders.map(wo => {
        if (wo.docId === docId) {
          updatedOrder = {
            ...wo,
            data: { ...data }
          };
          return updatedOrder;
        }
        return wo;
      })
    );

    this.saveToStorage();
    return updatedOrder;
  }

  /**
   * Delete a work order by ID
   */
  deleteWorkOrder(docId: string): boolean {
    const initialLength = this._workOrders().length;
    
    this._workOrders.update(orders => 
      orders.filter(wo => wo.docId !== docId)
    );

    const deleted = this._workOrders().length < initialLength;
    
    if (deleted) {
      this.saveToStorage();
    }
    
    return deleted;
  }

  /**
   * Reset to sample data (useful for testing)
   */
  resetToSampleData(): void {
    this._workOrders.set([...SAMPLE_WORK_ORDERS]);
    this.saveToStorage();
  }
}
