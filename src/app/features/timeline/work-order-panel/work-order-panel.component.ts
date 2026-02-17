import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { WorkCenterDocument } from '../../../core/models/work-center.model';
import { WorkOrderStatus, STATUS_CONFIG } from '../../../core/models/work-order.model';
import { PanelMode } from '../../../core/models/timeline.model';
import { WorkOrderService } from '../../../core/services/work-order.service';

/**
 * Work Order Panel Component
 * Slide-out panel for creating and editing work orders.
 * Uses Reactive Forms with validation.
 */
@Component({
  selector: 'app-work-order-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbDatepickerModule
  ],
  templateUrl: './work-order-panel.component.html',
  styleUrls: ['./work-order-panel.component.scss']
})
export class WorkOrderPanelComponent implements OnInit, OnChanges {
  @Input({ required: true }) mode!: PanelMode;
  @Input() workCenterId: string | null = null;
  @Input() workOrderId: string | null = null;
  @Input() prefilledStartDate: string | null = null;
  @Input({ required: true }) workCenters!: WorkCenterDocument[];

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private workOrderService = inject(WorkOrderService);

  /** Form group for work order data */
  form!: FormGroup;

  /** Status options for dropdown */
  statusOptions = Object.values(STATUS_CONFIG);

  /** Error message for overlap detection */
  overlapError = signal<string | null>(null);

  /** Loading state */
  isSubmitting = signal(false);

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode'] || changes['workOrderId'] || changes['prefilledStartDate']) {
      this.initForm();
    }
  }

  /**
   * Initialize the form based on mode (create or edit)
   */
  private initForm(): void {
    this.overlapError.set(null);

    if (this.mode === 'edit' && this.workOrderId) {
      // Edit mode: populate with existing data
      const workOrder = this.workOrderService.getWorkOrderById(this.workOrderId);
      if (workOrder) {
        this.form = this.fb.group({
          name: [workOrder.data.name, [Validators.required, Validators.minLength(1)]],
          workCenterId: [workOrder.data.workCenterId, Validators.required],
          status: [workOrder.data.status, Validators.required],
          startDate: [this.parseDate(workOrder.data.startDate), Validators.required],
          endDate: [this.parseDate(workOrder.data.endDate), Validators.required]
        });
      }
    } else {
      // Create mode: use prefilled values or defaults
      const today = new Date();
      const startDate = this.prefilledStartDate 
        ? this.parseDate(this.prefilledStartDate)
        : this.dateToStruct(today);
      
      const endDateObj = this.prefilledStartDate 
        ? new Date(this.prefilledStartDate)
        : new Date();
      endDateObj.setDate(endDateObj.getDate() + 7);
      const endDate = this.dateToStruct(endDateObj);

      this.form = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(1)]],
        workCenterId: [this.workCenterId, Validators.required],
        status: ['open' as WorkOrderStatus, Validators.required],
        startDate: [startDate, Validators.required],
        endDate: [endDate, Validators.required]
      });
    }
  }

  /**
   * Convert ISO date string to NgbDateStruct
   */
  private parseDate(dateStr: string): NgbDateStruct {
    const date = new Date(dateStr);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }

  /**
   * Convert Date to NgbDateStruct
   */
  private dateToStruct(date: Date): NgbDateStruct {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }

  /**
   * Convert NgbDateStruct to ISO date string
   */
  private structToIso(struct: NgbDateStruct): string {
    const month = struct.month.toString().padStart(2, '0');
    const day = struct.day.toString().padStart(2, '0');
    return `${struct.year}-${month}-${day}`;
  }

  /**
   * Validate that end date is after start date
   */
  private validateDates(): boolean {
    const startStruct = this.form.get('startDate')?.value;
    const endStruct = this.form.get('endDate')?.value;

    if (!startStruct || !endStruct) return false;

    const startDate = new Date(startStruct.year, startStruct.month - 1, startStruct.day);
    const endDate = new Date(endStruct.year, endStruct.month - 1, endStruct.day);

    return endDate >= startDate;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.validateDates()) {
      this.overlapError.set('End date must be on or after start date.');
      return;
    }

    this.isSubmitting.set(true);
    this.overlapError.set(null);

    const formValue = this.form.value;
    const startDate = this.structToIso(formValue.startDate);
    const endDate = this.structToIso(formValue.endDate);

    const workOrderData = {
      name: formValue.name.trim(),
      workCenterId: formValue.workCenterId,
      status: formValue.status as WorkOrderStatus,
      startDate,
      endDate
    };

    let result;

    if (this.mode === 'edit' && this.workOrderId) {
      result = this.workOrderService.updateWorkOrder(this.workOrderId, workOrderData);
    } else {
      result = this.workOrderService.createWorkOrder(workOrderData);
    }

    if (result === null) {
      // Overlap detected
      this.overlapError.set('This work order overlaps with an existing order on the same work center. Please adjust the dates.');
      this.isSubmitting.set(false);
      return;
    }

    this.isSubmitting.set(false);
    this.save.emit();
  }

  /**
   * Handle cancel button click
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Get the panel title based on mode
   */
  get panelTitle(): string {
    return 'Work Order Details';
  }

  /**
   * Get the submit button text based on mode
   */
  get submitButtonText(): string {
    return this.mode === 'edit' ? 'Save' : 'Create';
  }

  /**
   * Check if a form field has an error
   */
  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }
}
