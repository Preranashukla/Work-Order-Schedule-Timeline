import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineColumn } from '../../../core/models/timeline.model';

/**
 * Timeline Header Component
 * Displays date columns based on the current zoom level.
 * Shows day numbers, week numbers, or month names.
 */
@Component({
  selector: 'app-timeline-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline-header" [style.width.px]="totalWidth">
      <div 
        class="header-column"
        *ngFor="let col of columns; let i = index; trackBy: trackByColumn"
        [style.width.px]="columnWidth"
        [class.is-today]="col.isToday"
        [class.is-weekend]="col.isWeekend"
        [class.is-current-month]="isCurrentMonth(col.date)"
      >
        <span class="col-sub-label">{{ col.label }} {{ col.subLabel }}</span>
      </div>

      <!-- Today indicator line in header -->
      <div 
        class="today-indicator-header"
        [style.left.px]="todayPosition"
      ></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .timeline-header {
      display: flex;
      height: 56px;
      position: relative;
      background-color: #F8F9FC;
    }

    .header-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      border-right: 1px solid #F0F1F5;
      flex-shrink: 0;
      user-select: none;
      position: relative;
      padding: 8px 4px;

      &.is-weekend {
        background-color: rgba(248, 249, 252, 0.8);
      }

      &.is-today {
        background-color: rgba(86, 89, 255, 0.05);
      }

      &.is-current-month {
        background-color: rgba(86, 89, 255, 0.08);
      }
    }

    .col-sub-label {
      font-size: 11px;
      font-weight: 400;
      color: #9CA3B8;
      letter-spacing: 0.3px;
    }

    .col-label {
      font-size: 15px;
      font-weight: 500;
      color: #030929;
      letter-spacing: -0.1px;

      &.today-label {
        color: #5659FF;
        font-weight: 600;
      }
    }

    .today-indicator-header {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: #5659FF;
      z-index: 2;
      pointer-events: none;
    }
  `]
})
export class TimelineHeaderComponent {
  @Input({ required: true }) columns!: TimelineColumn[];
  @Input({ required: true }) columnWidth!: number;
  @Input({ required: true }) totalWidth!: number;
  @Input({ required: true }) todayPosition!: number;

  trackByColumn(index: number, col: TimelineColumn): string {
    return col.date.toISOString();
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
}
