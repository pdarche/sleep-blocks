'use strict';

/*
* Single night statistics
*
*/

var Utils = require('../utils/Utils');
var moment = require('moment');
var SparkLine = require('./SparkLine');

var RangeStats = React.createClass({
  createTime: function(time) {
    var time = moment.duration(time, 'minutes').asHours()
    return Math.round(time * 100) / 100
  },

  createStat: function(stat) {
    return (
      <div className="stats--stat">
        <div className="stats--stat-container">
          <h4 className="stats--name">{stat.name}</h4>
          <p className="stats--value">{stat.value}</p>
        </div>
        <div className="stats--sparkline">
          <SparkLine
            data={this.props.windows[stat.key] || this.props.windows.sleep}
            offset={this.props.offsetIx}
            stat={stat.key}
            dateRange={this.props.dateRange} />
        </div>
      </div>
    );
  },

  render: function() {
    var stats = Utils.computeRangeStats(this.props.nights)
    var startDate = this.props.dateRange[this.props.offsetIx].format('MMM Do');
    var endDate = this.props.dateRange[this.props.offsetIx + 12].format('MMM Do');
    var statCollection = [
      {name: 'Risetime', value: stats.risetime.mean, key: 'stat-risetime', unit: ''},
      {name: 'Bedtime', value: stats.bedtime.mean, key: 'stat-bedtime', unit: ''},
      {name: 'Avg Sleep', value: stats.sleep, key: 'stat-sleep', unit: ''},
      {name: 'Light Sleep', value: stats.light, key: 'stat-light', unit: ''},
      {name: 'Deep Sleep', value: stats.deep, key: 'deep'},
      {name: 'REM Sleep', value: stats.rem, key: 'rem'},
      {name: 'Time Awake', value: stats.wake, key: 'wake'}
    ]
    return (
      <div className="stats">
        <h4 className="stats--date">{startDate} - {endDate}</h4>
        <div>
            {statCollection.map(this.createStat)}
        </div>
      </div>
    );
  }
});

module.exports = RangeStats;
