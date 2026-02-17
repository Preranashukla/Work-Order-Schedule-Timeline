import { Injectable, signal, computed } from '@angular/core';
import { WorkCenterDocument } from '../models/work-center.model';
import { SAMPLE_WORK_CENTERS } from '../data/sample-data';

/**
 * Service for managing work center data.
 * Provides access to work centers and lookup functionality.
 */
@Injectable({
  providedIn: 'root'
})
export class WorkCenterService {
  /** Reactive signal holding all work centers */
  private readonly _workCenters = signal<WorkCenterDocument[]>(SAMPLE_WORK_CENTERS);

  /** Public readonly computed signal for work centers */
  readonly workCenters = computed(() => this._workCenters());

  /**
   * Get a work center by its document ID
   */
  getWorkCenterById(docId: string): WorkCenterDocument | undefined {
    return this._workCenters().find(wc => wc.docId === docId);
  }

  /**
   * Get work center name by ID (convenience method)
   */
  getWorkCenterName(docId: string): string {
    const wc = this.getWorkCenterById(docId);
    return wc ? wc.data.name : 'Unknown';
  }
}
