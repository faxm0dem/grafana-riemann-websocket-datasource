// vim: expandtab ts=2

import defaults from 'lodash/defaults';

import {
  CircularDataFrame,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

import { Observable, merge } from 'rxjs';

interface MyHash {
  [details: string]: number;
}

// source https://stackoverflow.com/a/11426309/2122722
var cons = {
  log: console.log,
  debug: function(...arg: any) {},
  info: function(...arg: any) {},
  warn: console.log,
  error: console.log,
};

function getSeriesId(event: any, ...keys: string[]): string {
  let parsedEvent = JSON.parse(event.data);
  let fields: string[] = keys.map(function(key) {
    return parsedEvent[key];
  });
  let id: string = fields.join('-');
  return id;
}

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  baseUrl: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.baseUrl = instanceSettings.jsonData.baseUrl || 'ws://localhost:5556';
  }
  query(options: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
    const streams = options.targets.map(target => {
      const query = defaults(target, defaultQuery);
      const ws = this.newRiemannWebSocket(query.queryText || '');
      let series: CircularDataFrame[] = [];
      let seriesList: MyHash = {};
      let seriesIndex = 0;
      cons.info(`[message] Processing query: ${query.queryText}`);
      return new Observable<DataQueryResponse>(subscriber => {
        ws.onmessage = function(event) {
          const parsedEvent = JSON.parse(event.data);
          const seriesId = getSeriesId(event, ...query.groupBy);
          let frame: CircularDataFrame;
          if (seriesId in seriesList) {
            cons.debug(`[message] we already know about series ${seriesId} having index ${seriesList[seriesId]}`);
            frame = series[seriesList[seriesId]]; // get series' frame
          } else {
            if (seriesIndex < query.maxSeries) {
              cons.debug(`[message] adding series ${seriesId}`);
              seriesList[seriesId] = seriesIndex++; // increment index
              frame = new CircularDataFrame({
                append: 'tail',
                capacity: query.maxPoints,
              });
              frame.refId = query.refId;
              frame.addField({ name: 'time', type: FieldType.time });
              frame.addField({ name: seriesId, type: FieldType.number });
              series.push(frame);
            } else {
              cons.info(`[message] MaxSeries reached! Not adding series ${seriesId}`);
              return;
            }
          }
          var f: Record<string, any> = {};
          f = {
            time: parsedEvent.time,
            metric: parsedEvent.metric,
            service: parsedEvent.service,
          };
          f[seriesId] = parsedEvent.metric;
          frame.add(f);
          subscriber.next({
            data: series,
            key: query.refId,
          });
        };
      });
    });

    return merge(...streams);
  }
  async testDatasource(): Promise<any> {
    let ws = this.newRiemannWebSocket('');
    let promise = new Promise(function(resolve, reject) {
      ws.onerror = function(event) {
        reject({
          status: 'error',
          message: `WebSocket Error: ${JSON.stringify(event)}`,
        });
      };
      ws.onopen = function(event) {
        resolve({
          status: 'success',
          message: `WebSocket Success: ${JSON.stringify(event)}`,
        });
      };
    });
    promise.then(
      function(result) {
        return result;
      },
      function(error) {
        return error;
      }
    );
    return promise;
  }
  newRiemannWebSocket(queryText: string): WebSocket {
    const Uri = this.baseUrl.concat('/index?subscribe=true&query=', queryText);
    cons.info(`[message] Opening new WS: ${Uri}`);
    return new WebSocket(encodeURI(Uri));
  }
}
