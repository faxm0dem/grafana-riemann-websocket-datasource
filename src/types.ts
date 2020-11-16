import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  queryText?: string;
  maxPoints: number;
  maxSeries: number;
  maxFreq: number;
  groupBy?: string[];
  stringFields: string[];
  numberFields: string[];
  webSocket?: WebSocket;
}

export const defaultQuery: Partial<MyQuery> = {
  queryText: 'tagged "riemann"',
  maxPoints: 100,
  maxSeries: 10,
  maxFreq: 1.0,
  groupBy: ['host', 'service'],
  stringFields: ['state'],
  numberFields: ['metric'],
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  baseUrl?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}
