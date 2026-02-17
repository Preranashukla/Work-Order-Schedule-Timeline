/**
 * Work Center Document - Represents a production line, machine, or work area
 * where work orders are scheduled.
 */
export interface WorkCenterDocument {
  docId: string;
  docType: 'workCenter';
  data: {
    name: string;
  };
}
