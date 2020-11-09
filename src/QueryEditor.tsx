// vim: expandtab ts=2
import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './DataSource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, queryText: event.target.value });
  };
  onGroupByChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, groupBy: event.target.value.split(',') });
  };
  onMaxPointsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, maxPoints: parseInt(event.target.value, 10) });
    onRunQuery();
  };
  onMaxSeriesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, maxSeries: parseInt(event.target.value, 10) });
    onRunQuery();
  };
  onMaxFreqChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, maxFreq: parseFloat(event.target.value) });
    onRunQuery();
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryText, maxPoints, maxSeries, maxFreq, groupBy } = query;

    return (
      <div className="gf-form">
        <FormField
          labelWidth={16}
          value={queryText || ''}
          onChange={this.onQueryTextChange}
          label="Query Text"
          tooltip="Riemann query. See test suite for examples https://github.com/riemann/riemann/blob/master/test/riemann/query_test.clj"
          inputWidth={30}
        />
        <FormField
          labelWidth={16}
          value={groupBy || ''}
          onChange={this.onGroupByChange}
          label="GroupBy"
          tooltip="Coma separated list of attributes to group series. Defaults to 'host,service'"
          inputWidth={16}
        />
        <FormField
          width={4}
          value={maxPoints}
          onChange={this.onMaxPointsChange}
          label="MaxDataPoints"
          type="number"
          tooltip="Maximum number of time series points returned"
        />
        <FormField
          width={4}
          value={maxSeries}
          onChange={this.onMaxSeriesChange}
          label="MaxSeries"
          type="number"
          tooltip="Maximum number of time series"
        />
        <FormField
          width={4}
          value={maxFreq}
          onChange={this.onMaxFreqChange}
          label="MaxFreq"
          type="number"
          tooltip="Currently not implemented"
        />
      </div>
    );
  }
}
