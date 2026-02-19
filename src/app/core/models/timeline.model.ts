/**
 * Zoom level options for the timeline view
 */
export type ZoomLevel = 'hour' | 'day' | 'week' | 'month';

/**
 * Represents a visible date range on the timeline
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Represents a single column in the timeline header
 */
export interface TimelineColumn {
  date: Date;
  label: string;
  subLabel?: string;
  isToday: boolean;
  isWeekend: boolean;
  width: number;
}

/**
 * Panel mode for create/edit work order
 */
export type PanelMode = 'create' | 'edit';

/**
 * Panel state
 */
export interface PanelState {
  isOpen: boolean;
  mode: PanelMode;
  workCenterId: string | null;
  workOrderId: string | null;
  prefilledStartDate: string | null;
}

/**
 * Column width configuration per zoom level (in pixels)
 */
export const COLUMN_WIDTHS: Record<ZoomLevel, number> = {
  hour: 40,
  day: 60,
  week: 120,
  month: 180
};

/**
 * Default buffer ranges per zoom level (in days)
 */
export const BUFFER_DAYS: Record<ZoomLevel, number> = {
  hour: 3,     // ±36 hours visible = 3 days total
  day: 30,     // ±2 weeks visible = ~30 days total
  week: 90,    // ±2 months visible
  month: 180   // ±3 months visible (reduced to match work order data range)
};
