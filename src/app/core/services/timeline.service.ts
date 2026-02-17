import { Injectable, signal, computed } from '@angular/core';
import { 
  ZoomLevel, 
  DateRange, 
  TimelineColumn, 
  COLUMN_WIDTHS, 
  BUFFER_DAYS 
} from '../models/timeline.model';

/**
 * Service for timeline calculations and state management.
 * Handles date-to-position conversions, column generation, and zoom level management.
 */
@Injectable({
  providedIn: 'root'
})
export class TimelineService {
  /** Current zoom level */
  private readonly _zoomLevel = signal<ZoomLevel>('day');
  
  /** Current visible date range */
  private readonly _dateRange = signal<DateRange>(this.calculateInitialRange('day'));

  /** Public readonly signals */
  readonly zoomLevel = computed(() => this._zoomLevel());
  readonly dateRange = computed(() => this._dateRange());

  /** Computed column width based on zoom level */
  readonly columnWidth = computed(() => COLUMN_WIDTHS[this._zoomLevel()]);

  /** Computed timeline columns */
  readonly columns = computed(() => 
    this.generateColumns(this._dateRange(), this._zoomLevel())
  );

  /** Total timeline width in pixels */
  readonly totalWidth = computed(() => 
    this.columns().length * this.columnWidth()
  );

  /**
   * Calculate initial date range centered on today
   */
  private calculateInitialRange(zoom: ZoomLevel): DateRange {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const bufferDays = BUFFER_DAYS[zoom];
    const halfBuffer = Math.floor(bufferDays / 2);
    
    const start = new Date(today);
    start.setDate(start.getDate() - halfBuffer);
    
    const end = new Date(today);
    end.setDate(end.getDate() + halfBuffer);
    
    return { start, end };
  }

  /**
   * Set the zoom level and recalculate date range
   */
  setZoomLevel(zoom: ZoomLevel): void {
    this._zoomLevel.set(zoom);
    this._dateRange.set(this.calculateInitialRange(zoom));
  }

  /**
   * Generate timeline columns based on date range and zoom level
   */
  private generateColumns(range: DateRange, zoom: ZoomLevel): TimelineColumn[] {
    const columns: TimelineColumn[] = [];
    const current = new Date(range.start);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (current <= range.end) {
      const isToday = current.toDateString() === today.toDateString();
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;

      columns.push({
        date: new Date(current),
        label: this.getColumnLabel(current, zoom),
        subLabel: this.getColumnSubLabel(current, zoom),
        isToday,
        isWeekend,
        width: COLUMN_WIDTHS[zoom]
      });

      // Increment based on zoom level
      this.incrementDate(current, zoom);
    }

    return columns;
  }

  /**
   * Get the main label for a column based on zoom level
   */
  private getColumnLabel(date: Date, zoom: ZoomLevel): string {
    switch (zoom) {
      case 'day':
        return date.getDate().toString();
      case 'week':
        return `W${this.getWeekNumber(date)}`;
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short' });
    }
  }

  /**
   * Get the sub-label for a column (e.g., day name, month for week view)
   */
  private getColumnSubLabel(date: Date, zoom: ZoomLevel): string | undefined {
    switch (zoom) {
      case 'day':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case 'week':
        return date.toLocaleDateString('en-US', { month: 'short' });
      case 'month':
        return date.getFullYear().toString();
    }
  }

  /**
   * Increment date based on zoom level
   */
  private incrementDate(date: Date, zoom: ZoomLevel): void {
    switch (zoom) {
      case 'day':
        date.setDate(date.getDate() + 1);
        break;
      case 'week':
        date.setDate(date.getDate() + 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() + 1);
        break;
    }
  }

  /**
   * Get ISO week number for a date
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Convert a date to pixel position on the timeline
   * @param date - The date to convert
   * @returns Pixel position from the start of the timeline
   */
  dateToPosition(date: Date | string): number {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const range = this._dateRange();
    const zoom = this._zoomLevel();
    
    const startTime = range.start.getTime();
    const targetTime = targetDate.getTime();
    
    // Calculate days from start
    const daysDiff = (targetTime - startTime) / (1000 * 60 * 60 * 24);
    
    // Convert to pixels based on zoom level
    switch (zoom) {
      case 'day':
        return daysDiff * COLUMN_WIDTHS.day;
      case 'week':
        return (daysDiff / 7) * COLUMN_WIDTHS.week;
      case 'month':
        // Approximate: 30.44 days per month
        return (daysDiff / 30.44) * COLUMN_WIDTHS.month;
    }
  }

  /**
   * Convert a pixel position to a date
   * @param position - Pixel position from the start of the timeline
   * @returns The corresponding date
   */
  positionToDate(position: number): Date {
    const range = this._dateRange();
    const zoom = this._zoomLevel();
    
    let daysDiff: number;
    
    switch (zoom) {
      case 'day':
        daysDiff = position / COLUMN_WIDTHS.day;
        break;
      case 'week':
        daysDiff = (position / COLUMN_WIDTHS.week) * 7;
        break;
      case 'month':
        daysDiff = (position / COLUMN_WIDTHS.month) * 30.44;
        break;
    }
    
    const result = new Date(range.start);
    result.setDate(result.getDate() + Math.floor(daysDiff));
    return result;
  }

  /**
   * Calculate the width of a work order bar in pixels
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @returns Width in pixels
   */
  calculateBarWidth(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Add 1 day to include the end date
    const daysDiff = ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const zoom = this._zoomLevel();
    
    switch (zoom) {
      case 'day':
        return daysDiff * COLUMN_WIDTHS.day;
      case 'week':
        return (daysDiff / 7) * COLUMN_WIDTHS.week;
      case 'month':
        return (daysDiff / 30.44) * COLUMN_WIDTHS.month;
    }
  }

  /**
   * Get the position of today's indicator line
   */
  getTodayPosition(): number {
    return this.dateToPosition(new Date());
  }

  /**
   * Scroll to center on today's date
   * @returns The scroll position to center on today
   */
  getScrollPositionForToday(containerWidth: number): number {
    const todayPos = this.getTodayPosition();
    return Math.max(0, todayPos - containerWidth / 2);
  }

  /**
   * Format a date for display
   */
  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format a date for form input (YYYY-MM-DD)
   */
  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
