import { Component, Input, Output, EventEmitter, signal, HostListener } from '@angular/core';
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
      <!-- Current month indicator -->
      @if (getCurrentMonthColumn() !== -1) {
        <div class="current-month-label" [style.left.px]="getCurrentMonthPosition()">
          Current month
        </div>
      }

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

      <!-- Hover Tooltip -->
      @if (tooltipVisible()) {
        <div 
          class="timeline-tooltip"
          [style.left.px]="tooltipX()"
          [style.top.px]="tooltipY()"
        >
          <span class="tooltip-icon">📌</span>
          <span class="tooltip-text">Click to add dates</span>
        </div>
      }
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
      cursor: pointer;
      transition: background-color 0.12s ease;

      &.hovered {
        background-color: var(--bg-hover, #F4F5F9);
      }
    }

    .grid-cell {
      height: 100%;
      flex-shrink: 0;
      border-right: 1px solid var(--border-light, #F0F1F5);

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

    .timeline-tooltip {
      position: fixed;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 14px;
      background-color: #5A5C6B;
      color: #FFFFFF;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      white-space: nowrap;
      animation: fadeIn 0.2s ease-out;
    }

    .tooltip-icon {
      font-size: 15px;
      line-height: 1;
      filter: grayscale(100%) brightness(2);
    }

    .tooltip-text {
      line-height: 1;
      letter-spacing: 0.2px;
    }

    .current-month-label {
      position: absolute;
      top: 0px;
      transform: translateX(-50%);
      font-size: 10px;
      font-weight: 600;
      color: #5659FF;
      background-color: rgba(86, 89, 255, 0.12);
      padding: 3px 10px;
      border-radius: 4px;
      white-space: nowrap;
      z-index: 100;
      letter-spacing: 0.3px;
      pointer-events: none;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
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

  /** Tooltip state */
  tooltipVisible = signal<boolean>(false);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

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
   * Handle mouse move to show/hide tooltip
   */
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Hide tooltip if hovering over a work order bar
    if (target.closest('app-work-order-bar')) {
      this.tooltipVisible.set(false);
      return;
    }

    // Show tooltip if hovering over grid cells
    if (target.classList.contains('grid-cell') || target.classList.contains('grid-row')) {
      this.tooltipVisible.set(true);
      this.tooltipX.set(event.clientX + 10);
      this.tooltipY.set(event.clientY + 10);
    } else {
      this.tooltipVisible.set(false);
    }
  }

  /**
   * Handle mouse leave to hide tooltip
   */
  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.tooltipVisible.set(false);
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

  /**
   * Check if the given date is in the current month
   */
  isCurrentMonth(date: Date): boolean {
    const today = new Date();
    return date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  }

  /**
   * Check if this is the first column of the month
   */
  isFirstColumnOfMonth(index: number): boolean {
    if (index === 0) return true;
    const currentCol = this.columns[index];
    const prevCol = this.columns[index - 1];
    return currentCol.date.getMonth() !== prevCol.date.getMonth();
  }

  /**
   * Get the index of the first column of the current month
   */
  getCurrentMonthColumn(): number {
    return this.columns.findIndex((col, i) => 
      this.isCurrentMonth(col.date) && this.isFirstColumnOfMonth(i)
    );
  }

  /**
   * Get the left position for the current month label
   */
  getCurrentMonthPosition(): number {
    const index = this.getCurrentMonthColumn();
    if (index === -1) return 0;
    return index * this.columnWidth + (this.columnWidth / 2);
  }
}
