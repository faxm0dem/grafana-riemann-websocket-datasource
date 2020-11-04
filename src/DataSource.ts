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
      const Uri = this.baseUrl.concat('/index?subscribe=true&query=', query.queryText || '');
      const ws = new WebSocket(encodeURI(Uri));
      let series: CircularDataFrame[] = [];
      let seriesList: MyHash = {};
      let seriesIndex = 0;
      console.log(`[message] Processing query: ${Uri}`);
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
  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
