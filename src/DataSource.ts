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
      console.log(`[message] Processing query: ${query.queryText}`);
      return new Observable<DataQueryResponse>(subscriber => {
        ws.onmessage = function(event) {
          const parsedEvent = JSON.parse(event.data);
          const service = parsedEvent.service;
          let frame: CircularDataFrame;
          if (service in seriesList) {
            // console.log(`[message] we already know about service ${service} and index ${seriesList[service]}`);
            frame = series[seriesList[service]]; // get service's frame
          } else {
            // console.log(`[message] adding service ${service}`);
            seriesList[service] = seriesIndex++; // increment index
            frame = new CircularDataFrame({
              append: 'tail',
              capacity: 100,
            });
            frame.refId = query.refId;
            frame.addField({ name: 'time', type: FieldType.time });
            frame.addField({ name: service, type: FieldType.number });
            series.push(frame);
          }
          var f: Record<string, any> = {};
          f = {
            time: parsedEvent.time,
            metric: parsedEvent.metric,
            service: parsedEvent.service,
          };
          f[service] = parsedEvent.metric;
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
    return new WebSocket(encodeURI(Uri));
  }
}
