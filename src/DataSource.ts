// vim: expandtab ts=2

import defaults from 'lodash/defaults';
// import './WebSocketOnMessage';

import {
  CircularDataFrame,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, defaultQuery, IwsList, NumberHash, cons } from './types';

import { Observable, merge } from 'rxjs';

import { getTemplateSrv } from '@grafana/runtime';

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
  wsList: IwsList;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.baseUrl = instanceSettings.jsonData.baseUrl || 'ws://localhost:5556';
    // Track pool of websockets
    this.wsList = {};
  }

  query(options: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
    const streams = options.targets.map(target => {
      const query = defaults(target, defaultQuery);
      const queryText = getTemplateSrv().replace(query.queryText, options.scopedVars);
      let ws: WebSocket;
      if (queryText in this.wsList) {
        cons.trace('Using existing ws for query', queryText);
        ws = this.wsList[queryText];
      } else {
        ws = this.newRiemannWebSocket(queryText || '');
        this.wsList[queryText] = ws;
        query.webSocket = ws;
        cons.trace('Creating new ws for query', queryText);
      }
      let series: CircularDataFrame[] = [];
      let seriesList: NumberHash = {};
      let seriesLastUpdate: NumberHash = {};
      let seriesIndex = 0;
      cons.info('Processing query ', queryText);
      return new Observable<DataQueryResponse>(subscriber => {
        ws.onmessage = function(event) {
          const parsedEvent = JSON.parse(event.data);
          const seriesId = getSeriesId(event, ...query.groupBy);
          let frame: CircularDataFrame;
          if (seriesId in seriesList) {
            cons.debug(`we already know about series ${seriesId} having index ${seriesList[seriesId]}`);
            frame = series[seriesList[seriesId]]; // get series' frame
          } else {
            if (seriesIndex < query.maxSeries) {
              cons.debug('Adding series ', seriesId);
              seriesLastUpdate[seriesId] = new Date().getTime() - 1000.0 / query.maxFreq;
              seriesList[seriesId] = seriesIndex++; // increment index
              frame = new CircularDataFrame({
                append: 'tail',
                capacity: query.maxPoints,
              });
              frame.refId = query.refId;
              frame.name = seriesId;
              frame.addField({ name: 'time', type: FieldType.time });
              query.numberFields.map(field => {
                frame.addField({ name: field, type: FieldType.number });
              });
              query.stringFields.map(field => {
                frame.addField({ name: field, type: FieldType.string });
              });
              series.push(frame);
            } else {
              cons.info('MaxSeries reached! Not adding series ', seriesId);
              return;
            }
          }
          const currentTime = new Date().getTime();
          if (currentTime - seriesLastUpdate[seriesId] >= 1000.0 / query.maxFreq) {
            frame.add(parsedEvent);
            subscriber.next({
              data: series,
              key: query.refId,
            });
            seriesLastUpdate[seriesId] = currentTime;
          } else {
            cons.trace('MaxFreq reached! Dropping new data for series ', seriesId);
          }
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
    cons.info('Opening new WS: ', Uri);
    return new WebSocket(encodeURI(Uri));
  }
}
