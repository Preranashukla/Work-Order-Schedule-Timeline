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
      [style.color]="config.color"
      [style.backgroundColor]="config.bgColor"
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

  get config() {
    return STATUS_CONFIG[this.status];
  }
}
