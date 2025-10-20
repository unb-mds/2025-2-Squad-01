export type HistogramDatum = {
  dateLabel: string;
  count: number;
};

export type PieDatum = {
  label: string;
  value: number;
  color?: string;
};

export type CollaborationEdge = {
  user1: string;
  user2: string;
  repo: string;
  collaboration_type: string;
  _metadata?: any;
};

export type HeatmapDataPoint = {
  day_of_week: number;
  hour: number;
  activity_count: number;
  _metadata?: any;
};
export type BasicDatum = {
  date: string;
  value: number;
};
 
