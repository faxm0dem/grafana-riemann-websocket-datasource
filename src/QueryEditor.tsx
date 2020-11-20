// vim: expandtab ts=2
import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { InlineFieldRow, InlineField, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './DataSource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

// This is a temporary work-around for a styling issue related to the new Input component.
// For more information, refer to https://github.com/grafana/grafana/issues/26512.
import {} from '@emotion/core';

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
      <>
        <InlineFieldRow>
          <InlineField
            labelWidth={20}
            label="Query text"
            tooltip="Riemann query. See test suite for examples https://github.com/riemann/riemann/blob/master/test/riemann/query_test.clj"
          >
            <Input value={queryText || ''} width={25} onChange={this.onQueryTextChange} />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField
            labelWidth={20}
            label="Group by"
            tooltip="Comma separated list of attributes to group series. Events sharing these attributes will end up in the same series. Defaults to 'host,service'"
          >
            <Input value={groupBy || 'host,service'} width={25} onChange={this.onGroupByChange} />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField
            labelWidth={20}
            label="Numeric fields"
            tooltip="Comma separated list of numeric fields. Currently Riemann only provides ttl and metric as numerical data. Example: 'metric,ttl'"
          >
            <Input value={numberFields || 'metric'} width={25} onChange={this.onNumberFieldsChange} />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField
            labelWidth={20}
            label="String fields"
            tooltip="Comma separated list of attributes to return as fields. Defaults to 'state'"
          >
            <Input value={stringFields || 'state'} width={25} onChange={this.onStringFieldsChange} />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField
            labelWidth={20}
            label="Max series"
            tooltip="Maximum number of time series. Or maximal cardinality of returned data with respect to the GroupBy tuple. Series are kept in a first-in-only kept fashion."
          >
            <Input value={maxSeries} width={25} onChange={this.onMaxSeriesChange} />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField
            labelWidth={20}
            label="Max data points"
            tooltip="Maximum number of time series points returned per series. Data points will be kept in a round robin fifo fashion."
          >
            <Input value={maxPoints} width={25} onChange={this.onMaxPointsChange} />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField
            labelWidth={20}
            label="Max frequency"
            tooltip="Maximum frequency of incoming events per series. For instance MaxFreq=1 and MaxSeries=10 will yield at most 10 points per second."
          >
            <Input value={maxFreq} width={25} onChange={this.onMaxFreqChange} />
          </InlineField>
        </InlineFieldRow>
      </>
    );
  }
}
