import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkOrderStatus, STATUS_CONFIG } from '../../../core/models/work-order.model';

/**
 * Reusable status badge component that displays a colored pill
 * indicating the work order status.
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="status-badge"
      [style.color]="textColor"
      [style.backgroundColor]="backgroundColor"
      [style.boxShadow]="contrast ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'"
    >
      {{ config.label }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 500;
      font-family: "Circular Std", "CircularStd", sans-serif;
      white-space: nowrap;
      line-height: 1.4;
      letter-spacing: 0.2px;
    }
  `]
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: WorkOrderStatus;
  @Input() contrast = false;

  get config() {
    return STATUS_CONFIG[this.status];
  }

  get backgroundColor() {
    if (this.contrast) {
      switch (this.status) {
        case 'open': return 'rgba(6, 182, 212, 0.1)';
        case 'in-progress': return 'rgba(139, 92, 246, 0.1)';
        case 'complete': return 'rgba(34, 197, 94, 0.1)';
        case 'blocked': return 'rgba(249, 115, 22, 0.1)';
      }
    }
    return this.config.bgColor;
  }

  get textColor() {
    if (this.contrast) {
      switch (this.status) {
        case 'open': return '#06B6D4';
        case 'in-progress': return '#8B5CF6';
        case 'complete': return '#22C55E';
        case 'blocked': return '#F97316';
      }
    }
    return this.config.color;
  }
}
