import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkCenterDocument } from '../../../core/models/work-center.model';
import { WorkOrderDocument } from '../../../core/models/work-order.model';
import { assignLanesByWorkCenter, getLaneCount } from '../../../core/utils/lane-assignment.util';

/**
 * Work Center List Component
 * Fixed left panel showing work center names.
 * Synchronized with the timeline grid rows.
 */
@Component({
  selector: 'app-work-center-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="work-center-list">
      <div 
        class="work-center-row"
        *ngFor="let wc of workCenters; let i = index; trackBy: trackByWc"
        [style.height.px]="getRowHeight(wc.docId)"
        [class.hovered]="hoveredRowIndex === i"
        (mouseenter)="rowHover.emit(i)"
        (mouseleave)="rowLeave.emit()"
      >
        <span class="wc-name">{{ wc.data.name }}</span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .work-center-list {
      display: flex;
      flex-direction: column;
    }

    .work-center-row {
      display: flex;
      align-items: center;
      min-height: 64px;
      padding: 0 20px;
      border-bottom: 1px solid #F0F1F5;
      cursor: default;
      transition: background-color 0.15s ease;
      background-color: #FFFFFF;

      &.hovered {
        background-color: #F8F9FC;
      }
    }

    .wc-name {
      font-size: 14px;
      font-weight: 500;
      color: #030929;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: -0.1px;
    }
  `]
})
export class WorkCenterListComponent implements OnInit, OnChanges {
  @Input({ required: true }) workCenters!: WorkCenterDocument[];
  @Input({ required: true }) workOrders!: WorkOrderDocument[];
  @Input() hoveredRowIndex: number = -1;

  @Output() rowHover = new EventEmitter<number>();
  @Output() rowLeave = new EventEmitter<void>();

  /** Lane assignments by work center */
  private laneAssignments = new Map<string, any[]>();
  
  /** Lane configuration - must match timeline-grid */
  private readonly LANE_HEIGHT = 44;
  private readonly MIN_ROW_HEIGHT = 64;

  ngOnInit(): void {
    this.updateLaneAssignments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workOrders']) {
      this.updateLaneAssignments();
    }
  }

  /**
   * Update lane assignments for all work centers
   */
  private updateLaneAssignments(): void {
    this.laneAssignments = assignLanesByWorkCenter(this.workOrders);
  }

  /**
   * Get the height for a work center row based on number of lanes needed
   * Must match the calculation in timeline-grid component
   */
  getRowHeight(workCenterId: string): number {
    const orders = this.laneAssignments.get(workCenterId) || [];
    if (orders.length === 0) return this.MIN_ROW_HEIGHT;
    
    const laneCount = getLaneCount(orders);
    const calculatedHeight = laneCount * this.LANE_HEIGHT + 20; // 20px padding
    return Math.max(this.MIN_ROW_HEIGHT, calculatedHeight);
  }

  trackByWc(index: number, wc: WorkCenterDocument): string {
    return wc.docId;
  }
}
