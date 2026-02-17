import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { WorkCenterService } from '../../../core/services/work-center.service';
import { WorkOrderService } from '../../../core/services/work-order.service';
import { TimelineService } from '../../../core/services/timeline.service';
import { ZoomLevel, PanelState } from '../../../core/models/timeline.model';
import { WorkOrderDocument } from '../../../core/models/work-order.model';

import { TimelineHeaderComponent } from '../timeline-header/timeline-header.component';
import { TimelineGridComponent } from '../timeline-grid/timeline-grid.component';
import { WorkCenterListComponent } from '../work-center-list/work-center-list.component';
import { WorkOrderPanelComponent } from '../work-order-panel/work-order-panel.component';

@Component({
  selector: 'app-timeline-container',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    TimelineHeaderComponent,
    TimelineGridComponent,
    WorkCenterListComponent,
    WorkOrderPanelComponent
  ],
  templateUrl: './timeline-container.component.html',
  styleUrls: ['./timeline-container.component.scss']
})
export class TimelineContainerComponent implements OnInit, AfterViewInit {
  @ViewChild('timelineScrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('headerScrollContainer') headerScrollContainer!: ElementRef<HTMLDivElement>;

  /** Zoom level options for the dropdown */
  zoomOptions = [
    { label: 'Day', value: 'day' as ZoomLevel },
    { label: 'Week', value: 'week' as ZoomLevel },
    { label: 'Month', value: 'month' as ZoomLevel }
  ];

  /** Current selected zoom level */
  selectedZoom: ZoomLevel = 'day';

  /** Panel state */
  panelState = signal<PanelState>({
    isOpen: false,
    mode: 'create',
    workCenterId: null,
    workOrderId: null,
    prefilledStartDate: null
  });

  /** Hovered row index */
  hoveredRowIndex = signal<number>(-1);

  constructor(
    public workCenterService: WorkCenterService,
    public workOrderService: WorkOrderService,
    public timelineService: TimelineService
  ) {}

  ngOnInit(): void {
    this.selectedZoom = this.timelineService.zoomLevel();
  }

  ngAfterViewInit(): void {
    // Center on today after view initializes
    setTimeout(() => this.scrollToToday(), 100);
  }

  /**
   * Handle zoom level change from dropdown
   */
  onZoomChange(zoom: ZoomLevel): void {
    this.selectedZoom = zoom;
    this.timelineService.setZoomLevel(zoom);
    // Re-center on today after zoom change
    setTimeout(() => this.scrollToToday(), 50);
  }

  /**
   * Synchronize horizontal scroll between header and grid
   */
  onTimelineScroll(event: Event): void {
    const target = event.target as HTMLDivElement;
    if (this.headerScrollContainer) {
      this.headerScrollContainer.nativeElement.scrollLeft = target.scrollLeft;
    }
  }

  /**
   * Scroll timeline to center on today's date
   */
  scrollToToday(): void {
    if (this.scrollContainer) {
      const containerWidth = this.scrollContainer.nativeElement.clientWidth;
      const scrollPos = this.timelineService.getScrollPositionForToday(containerWidth);
      this.scrollContainer.nativeElement.scrollLeft = scrollPos;
      if (this.headerScrollContainer) {
        this.headerScrollContainer.nativeElement.scrollLeft = scrollPos;
      }
    }
  }

  /**
   * Handle click on empty timeline area to create a new work order
   */
  onTimelineClick(event: { workCenterId: string; date: Date }): void {
    const dateStr = this.timelineService.formatDateForInput(event.date);
    
    this.panelState.set({
      isOpen: true,
      mode: 'create',
      workCenterId: event.workCenterId,
      workOrderId: null,
      prefilledStartDate: dateStr
    });
  }

  /**
   * Handle edit action from work order bar
   */
  onEditWorkOrder(workOrderId: string): void {
    const workOrder = this.workOrderService.getWorkOrderById(workOrderId);
    if (workOrder) {
      this.panelState.set({
        isOpen: true,
        mode: 'edit',
        workCenterId: workOrder.data.workCenterId,
        workOrderId: workOrder.docId,
        prefilledStartDate: null
      });
    }
  }

  /**
   * Handle delete action from work order bar
   */
  onDeleteWorkOrder(workOrderId: string): void {
    this.workOrderService.deleteWorkOrder(workOrderId);
  }

  /**
   * Close the panel
   */
  onPanelClose(): void {
    this.panelState.set({
      isOpen: false,
      mode: 'create',
      workCenterId: null,
      workOrderId: null,
      prefilledStartDate: null
    });
  }

  /**
   * Handle panel save (create or edit)
   */
  onPanelSave(): void {
    this.onPanelClose();
  }

  /**
   * Track work centers by docId for ngFor performance
   */
  trackByWorkCenter(index: number, wc: any): string {
    return wc.docId;
  }
}
