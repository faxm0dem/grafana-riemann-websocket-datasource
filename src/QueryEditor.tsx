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
  onStringFieldsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, stringFields: event.target.value.split(',') });
  };
  onNumberFieldsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, numberFields: event.target.value.split(',') });
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
    const { queryText, maxPoints, maxSeries, maxFreq, groupBy, stringFields, numberFields } = query;

    return (
      <div className="gf-form-max-width-25">
        <FormField
          labelWidth={10}
          value={queryText || ''}
          onChange={this.onQueryTextChange}
          label="Query Text"
          tooltip="Riemann query. See test suite for examples https://github.com/riemann/riemann/blob/master/test/riemann/query_test.clj"
          inputWidth={100}
        />
        <FormField
          labelWidth={10}
          value={groupBy || 'host,service'}
          onChange={this.onGroupByChange}
          label="GroupBy"
          tooltip="Coma separated list of attributes to group series. Events sharing these attributes will end up in the same series. Defaults to 'host,service'"
          inputWidth={16}
        />
        <FormField
          labelWidth={10}
          value={numberFields || 'metric'}
          onChange={this.onNumberFieldsChange}
          label="NumericFields"
          tooltip="Coma separated list of numeric fields. Currently Riemann only provides ttl and metric as numerical data. Example: 'metric,ttl'"
          inputWidth={16}
        />
        <FormField
          labelWidth={10}
          value={stringFields || 'state'}
          onChange={this.onStringFieldsChange}
          label="StringFields"
          tooltip="Coma separated list of attributes to return as fields. Defaults to 'state'"
          inputWidth={16}
        />
        <FormField
          labelWidth={10}
          width={4}
          value={maxSeries}
          onChange={this.onMaxSeriesChange}
          label="MaxSeries"
          type="number"
          tooltip="Maximum number of time series. Or maximal cardinality of returned data with respect to the GroupBy tuple. Series are kept in a first-in-only kept fashion."
        />
        <FormField
          labelWidth={10}
          width={10}
          value={maxPoints}
          onChange={this.onMaxPointsChange}
          label="MaxDataPoints"
          type="number"
          tooltip="Maximum number of time series points returned per series. Data points will be kept in a round robin fifo fashion."
        />
        <FormField
          labelWidth={10}
          width={4}
          value={maxFreq}
          onChange={this.onMaxFreqChange}
          label="MaxFreq"
          type="number"
          tooltip="Maximum frequency of incoming events per series. For instance MaxFreq=1 and MaxSeries=10 will yield at most 10 points per second."
        />
      </div>
    );
  }
}
