import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkCenterDocument } from '../../../core/models/work-center.model';

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
      height: 64px;
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
export class WorkCenterListComponent {
  @Input({ required: true }) workCenters!: WorkCenterDocument[];
  @Input() hoveredRowIndex: number = -1;

  @Output() rowHover = new EventEmitter<number>();
  @Output() rowLeave = new EventEmitter<void>();

  trackByWc(index: number, wc: WorkCenterDocument): string {
    return wc.docId;
  }
}
