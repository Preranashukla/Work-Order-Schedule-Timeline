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
        *ngFor="let col of columns; trackBy: trackByColumn"
        [style.width.px]="columnWidth"
        [class.is-today]="col.isToday"
        [class.is-weekend]="col.isWeekend"
      >
        <span class="col-sub-label">{{ col.subLabel }}</span>
        <span class="col-label" [class.today-label]="col.isToday">{{ col.label }}</span>
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
      height: var(--header-height, 56px);
      position: relative;
    }

    .header-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      border-right: 1px solid var(--border-light, #F0F1F5);
      flex-shrink: 0;
      user-select: none;

      &.is-weekend {
        background-color: rgba(248, 249, 252, 0.6);
      }

      &.is-today {
        background-color: rgba(86, 89, 255, 0.04);
      }
    }

    .col-sub-label {
      font-size: 10px;
      font-weight: 400;
      color: var(--text-labels, #687196);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .col-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary, #030929);

      &.today-label {
        color: var(--element-primary-3, #5659FF);
        font-weight: 700;
      }
    }

    .today-indicator-header {
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
export class TimelineHeaderComponent {
  @Input({ required: true }) columns!: TimelineColumn[];
  @Input({ required: true }) columnWidth!: number;
  @Input({ required: true }) totalWidth!: number;
  @Input({ required: true }) todayPosition!: number;

  trackByColumn(index: number, col: TimelineColumn): string {
    return col.date.toISOString();
  }
}
