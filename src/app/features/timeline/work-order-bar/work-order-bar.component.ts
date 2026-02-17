import { Component, Input, Output, EventEmitter, HostListener, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkOrderDocument, STATUS_CONFIG } from '../../../core/models/work-order.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

/**
 * Work Order Bar Component
 * Displays a single work order as a horizontal bar on the timeline.
 * Includes status badge, name, and three-dot actions menu.
 */
@Component({
  selector: 'app-work-order-bar',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div 
      class="work-order-bar"
      [style.left.px]="leftPosition"
      [style.width.px]="barWidth"
      [style.backgroundColor]="statusConfig.bgColor"
      [style.borderColor]="statusConfig.color"
      [class.hovered]="isHovered"
      (mouseenter)="isHovered = true"
      (mouseleave)="onMouseLeave()"
    >
      <div class="bar-content">
        <span class="bar-name">{{ workOrder.data.name }}</span>
        <app-status-badge [status]="workOrder.data.status" />
      </div>

      <!-- Three-dot actions menu -->
      <button 
        class="actions-btn"
        (click)="toggleMenu($event)"
        [class.visible]="isHovered || menuOpen()"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="3" r="1.5" [attr.fill]="statusConfig.color"/>
          <circle cx="8" cy="8" r="1.5" [attr.fill]="statusConfig.color"/>
          <circle cx="8" cy="13" r="1.5" [attr.fill]="statusConfig.color"/>
        </svg>
      </button>

      <!-- Dropdown Menu -->
      @if (menuOpen()) {
        <div class="actions-dropdown" (click)="$event.stopPropagation()">
          <button class="dropdown-item" (click)="onEdit()">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 1.75L12.25 3.5L10.5 5.25M1.75 12.25H3.5L10.5 5.25L8.75 3.5L1.75 10.5V12.25Z" stroke="#687196" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Edit
          </button>
          <button class="dropdown-item delete" (click)="onDelete()">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1.75 3.5H12.25M5.25 6.125V10.375M8.75 6.125V10.375M2.625 3.5L3.5 11.375C3.5 11.8582 3.89175 12.25 4.375 12.25H9.625C10.1082 12.25 10.5 11.8582 10.5 11.375L11.375 3.5M5.25 3.5V1.75H8.75V3.5" stroke="#E74C3C" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Delete
          </button>
        </div>
      }

      <!-- Tooltip on hover (bonus) -->
      @if (isHovered && !menuOpen()) {
        <div class="bar-tooltip">
          <div class="tooltip-name">{{ workOrder.data.name }}</div>
          <div class="tooltip-dates">{{ workOrder.data.startDate }} → {{ workOrder.data.endDate }}</div>
          <div class="tooltip-status">
            <app-status-badge [status]="workOrder.data.status" />
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 3;
    }

    .work-order-bar {
      position: absolute;
      height: 40px;
      border-radius: 6px;
      border-left: 3px solid;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px 0 10px;
      cursor: pointer;
      transition: box-shadow 0.15s ease, transform 0.1s ease;
      overflow: hidden;

      &.hovered {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        z-index: 5;
      }
    }

    .bar-content {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
      flex: 1;
      min-width: 0;
    }

    .bar-name {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-primary, #030929);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .actions-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.15s ease, background-color 0.12s ease;
      flex-shrink: 0;

      &.visible {
        opacity: 1;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.06);
      }
    }

    .actions-dropdown {
      position: absolute;
      top: 100%;
      right: 4px;
      margin-top: 4px;
      background: var(--bg-white, #FFFFFF);
      border: 1px solid var(--border-color, #E8EAF0);
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      z-index: 100;
      min-width: 120px;
      overflow: hidden;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 12px;
      border: none;
      background: transparent;
      font-size: 13px;
      font-weight: 400;
      color: var(--text-primary, #030929);
      cursor: pointer;
      font-family: "Circular Std", "CircularStd", sans-serif;
      transition: background-color 0.12s ease;

      &:hover {
        background-color: var(--bg-hover, #F4F5F9);
      }

      &.delete {
        color: #E74C3C;

        &:hover {
          background-color: #FEF2F2;
        }
      }
    }

    .bar-tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: var(--text-primary, #030929);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 200;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

      &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: var(--text-primary, #030929);
      }

      .tooltip-name {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .tooltip-dates {
        font-size: 11px;
        opacity: 0.8;
        margin-bottom: 4px;
      }
    }
  `]
})
export class WorkOrderBarComponent {
  @Input({ required: true }) workOrder!: WorkOrderDocument;
  @Input({ required: true }) leftPosition!: number;
  @Input({ required: true }) barWidth!: number;

  @Output() editWorkOrder = new EventEmitter<string>();
  @Output() deleteWorkOrder = new EventEmitter<string>();

  isHovered = false;
  menuOpen = signal(false);

  get statusConfig() {
    return STATUS_CONFIG[this.workOrder.data.status];
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.update(v => !v);
  }

  onEdit(): void {
    this.menuOpen.set(false);
    this.editWorkOrder.emit(this.workOrder.docId);
  }

  onDelete(): void {
    this.menuOpen.set(false);
    this.deleteWorkOrder.emit(this.workOrder.docId);
  }

  onMouseLeave(): void {
    this.isHovered = false;
    this.menuOpen.set(false);
  }

  /** Close menu when clicking outside */
  @HostListener('document:click')
  onDocumentClick(): void {
    this.menuOpen.set(false);
  }
}
