import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkCenterDocument } from '../../../core/models/work-center.model';
import { WorkOrderDocument } from '../../../core/models/work-order.model';
import { TimelineColumn } from '../../../core/models/timeline.model';
import { TimelineService } from '../../../core/services/timeline.service';
import { WorkOrderBarComponent } from '../work-order-bar/work-order-bar.component';

/**
 * Timeline Grid Component
 * Renders the scrollable grid area with work order bars.
 * Handles click-to-create and row hover interactions.
 */
@Component({
  selector: 'app-timeline-grid',
  standalone: true,
  imports: [CommonModule, WorkOrderBarComponent],
  template: `
    <div class="timeline-grid" [style.width.px]="totalWidth">
      <!-- Grid rows for each work center -->
      <div 
        class="grid-row"
        *ngFor="let wc of workCenters; let i = index; trackBy: trackByWc"
        [class.hovered]="hoveredRowIndex === i"
        (mouseenter)="rowHover.emit(i)"
        (mouseleave)="rowLeave.emit()"
        (click)="onRowClick($event, wc.docId)"
      >
        <!-- Grid column lines -->
        <div 
          class="grid-cell"
          *ngFor="let col of columns; trackBy: trackByCol"
          [style.width.px]="columnWidth"
          [class.is-weekend]="col.isWeekend"
          [class.is-today]="col.isToday"
        ></div>

        <!-- Work order bars for this row -->
        <app-work-order-bar
          *ngFor="let wo of getWorkOrdersForCenter(wc.docId); trackBy: trackByWo"
          [workOrder]="wo"
          [leftPosition]="getBarLeft(wo)"
          [barWidth]="getBarWidth(wo)"
          (editWorkOrder)="editWorkOrder.emit($event)"
          (deleteWorkOrder)="deleteWorkOrder.emit($event)"
        />
      </div>

      <!-- Today indicator line (full height) -->
      <div 
        class="today-indicator"
        [style.left.px]="todayPosition"
      ></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .timeline-grid {
      position: relative;
      min-height: 100%;
    }

    .grid-row {
      display: flex;
      position: relative;
      height: var(--row-height, 64px);
      min-height: var(--row-height, 64px);
      border-bottom: 1px solid var(--border-light, #F0F1F5);
      cursor: pointer;
      transition: background-color 0.12s ease;

      &.hovered {
        background-color: var(--bg-hover, #F4F5F9);
      }
    }

    .grid-cell {
      height: 100%;
      border-right: 1px solid var(--border-light, #F0F1F5);
      flex-shrink: 0;

      &.is-weekend {
        background-color: rgba(248, 249, 252, 0.4);
      }

      &.is-today {
        background-color: rgba(86, 89, 255, 0.03);
      }
    }

    .today-indicator {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: var(--element-primary-3, #5659FF);
      z-index: 2;
      pointer-events: none;
    }
  `]
})
export class TimelineGridComponent {
  @Input({ required: true }) workCenters!: WorkCenterDocument[];
  @Input({ required: true }) workOrders!: WorkOrderDocument[];
  @Input({ required: true }) columns!: TimelineColumn[];
  @Input({ required: true }) columnWidth!: number;
  @Input({ required: true }) totalWidth!: number;
  @Input({ required: true }) todayPosition!: number;
  @Input({ required: true }) timelineService!: TimelineService;
  @Input() hoveredRowIndex: number = -1;

  @Output() rowHover = new EventEmitter<number>();
  @Output() rowLeave = new EventEmitter<void>();
  @Output() timelineClick = new EventEmitter<{ workCenterId: string; date: Date }>();
  @Output() editWorkOrder = new EventEmitter<string>();
  @Output() deleteWorkOrder = new EventEmitter<string>();

  /**
   * Get work orders for a specific work center
   */
  getWorkOrdersForCenter(workCenterId: string): WorkOrderDocument[] {
    return this.workOrders.filter(wo => wo.data.workCenterId === workCenterId);
  }

  /**
   * Calculate the left position of a work order bar
   */
  getBarLeft(wo: WorkOrderDocument): number {
    return this.timelineService.dateToPosition(wo.data.startDate);
  }

  /**
   * Calculate the width of a work order bar
   */
  getBarWidth(wo: WorkOrderDocument): number {
    return this.timelineService.calculateBarWidth(wo.data.startDate, wo.data.endDate);
  }

  /**
   * Handle click on empty area of a row to create a new work order.
   * Converts click position to a date.
   */
  onRowClick(event: MouseEvent, workCenterId: string): void {
    // Only trigger if clicking on the grid background, not on a work order bar
    const target = event.target as HTMLElement;
    if (target.closest('app-work-order-bar')) {
      return;
    }

    // Get click position relative to the grid
    const gridElement = (event.currentTarget as HTMLElement).closest('.grid-row');
    if (!gridElement) return;

    const rect = gridElement.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    // Convert position to date
    const date = this.timelineService.positionToDate(clickX + this.getScrollOffset(event));
    
    this.timelineClick.emit({ workCenterId, date });
  }

  /**
   * Get the horizontal scroll offset from the scroll container
   */
  private getScrollOffset(event: MouseEvent): number {
    const scrollContainer = (event.target as HTMLElement).closest('.timeline-grid-scroll');
    return scrollContainer ? scrollContainer.scrollLeft : 0;
  }

  trackByWc(index: number, wc: WorkCenterDocument): string {
    return wc.docId;
  }

  trackByCol(index: number, col: TimelineColumn): string {
    return col.date.toISOString();
  }

  trackByWo(index: number, wo: WorkOrderDocument): string {
    return wo.docId;
  }
}
