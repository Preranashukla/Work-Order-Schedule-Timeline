import { Component, Input, Output, EventEmitter, HostListener, HostBinding, ElementRef, signal } from '@angular/core';
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
      tabindex="0"
      role="button"
      [attr.aria-label]="'Work order: ' + workOrder.data.name + ', Status: ' + workOrder.data.status"
      (keydown.enter)="onEdit()"
      (keydown.space)="onEdit()"
    >
      <div class="bar-content">
        <span class="bar-name">{{ workOrder.data.name }}</span>
      </div>

      <div class="bar-actions">
        <app-status-badge [status]="workOrder.data.status" [contrast]="true" />
        
        <!-- Three-dot actions menu -->
        <button 
          class="actions-btn"
          (click)="toggleMenu($event)"
          [class.visible]="isHovered || menuOpen()"
          aria-label="Work order actions"
          [attr.aria-expanded]="menuOpen()"
          aria-haspopup="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="3" r="1.5" [attr.fill]="statusConfig.color"/>
            <circle cx="8" cy="8" r="1.5" [attr.fill]="statusConfig.color"/>
            <circle cx="8" cy="13" r="1.5" [attr.fill]="statusConfig.color"/>
          </svg>
        </button>
      </div>

      <!-- Dropdown Menu -->
      @if (menuOpen()) {
        <div class="actions-dropdown" (click)="$event.stopPropagation()" role="menu">
          <button class="dropdown-item" (click)="onEdit()" role="menuitem">
            <span>Edit</span>
          </button>
          <button class="dropdown-item delete" (click)="onDelete()" role="menuitem">
           <span>Delete </span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      position: absolute;
      z-index: 3;

      &.menu-open {
        z-index: 100;
      }
    }

    .work-order-bar {
      position: absolute;
      height: 38px;
      border-radius: 6px;
      border-left: 3px solid;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px 0 10px;
      cursor: pointer;
      transition: box-shadow 0.15s ease;
      overflow: visible;
      will-change: box-shadow;
      backface-visibility: hidden;
      transform: translateZ(0);

      &.hovered {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      }
    }

    .bar-content {
      display: flex;
      align-items: center;
      overflow: hidden;
      flex: 1;
      min-width: 0;
      margin-right: 8px;
    }

    .bar-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
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
        background-color: rgba(0, 0, 0, 0.08);
      }

      &:active {
        background-color: rgba(0, 0, 0, 0.12);
      }
    }

    .actions-dropdown {
      position: absolute;
      top: 100%;
      left: 339px;
      margin-top: 4px;
      width: 200px;
      height: 80px;
      background-color: rgba(255, 255, 255, 1);
      border-radius: 5px;
      box-shadow: 0 0 0 1px rgba(104, 113, 150, 0.1),
                  0 2.5px 3px -1.5px rgba(200, 207, 233, 1),
                  0 4.5px 5px -1px rgba(216, 220, 235, 1);
      z-index: 9999;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 150px;
      padding: 8px 12px;
      border: none;
      background: transparent;
      font-size: 14px;
      font-weight: 400;
      color: var(--text-primary, #030929);
      cursor: pointer;
      font-family: "Circular Std", "CircularStd", sans-serif;
      transition: background-color 0.12s ease;
      font-style: book;

      &:hover {
        background-color: var(--bg-hover, #F4F5F9);
      }

      &.delete {

color: rgba(62, 64, 219, 1);
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
  @Input() zIndex: number = 3;

  @Output() editWorkOrder = new EventEmitter<string>();
  @Output() deleteWorkOrder = new EventEmitter<string>();

  isHovered = false;
  menuOpen = signal(false);

  @HostBinding('class.menu-open')
  get isMenuOpen() {
    return this.menuOpen();
  }

  @HostBinding('style.z-index')
  get hostZIndex() {
    return this.menuOpen() ? 100 : this.zIndex;
  }

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
