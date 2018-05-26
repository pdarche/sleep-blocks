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
    var className = this.props.sliderGrabbed
      ? "stats--sparkline shown"
      : "stats--sparkline hidden"

    return (
      <div className="stats--stat">
        <div className="stats--stat-container">
          <h4 className="stats--name">{stat.name}</h4>
          <p className="stats--value">{stat.value}</p>
        </div>
        <div className={className}>
          <SparkLine
            data={this.props.windows[stat.key]}
            offset={this.props.offsetIx}
            stat={stat.key}
            dateRange={this.props.dateRange} />
        </div>
      </div>
    );
  },

  render: function() {
    var stats = Utils.computeRangeStats(this.props.activeNights)
    var startDate = this.props.dateRange[this.props.offsetIx].format('MMM Do');
    var endDate = this.props.dateRange[this.props.offsetIx + this.props.visibleNights].format('MMM Do');

    var statCollection = [
      {name: 'Bedtime', value: stats.bedtime.mean, key: 'bedtime', unit: ''},
      {name: 'Risetime', value: stats.risetime.mean, key: 'risetime', unit: ''},
      {name: 'Avg Sleep', value: stats.sleep, key: 'sleep', unit: ''},
      {name: 'Light Sleep', value: stats.light, key: 'light', unit: ''},
      {name: 'Deep Sleep', value: stats.deep, key: 'deep'},
      {name: 'REM Sleep', value: stats.rem, key: 'rem'},
      {name: 'Time Awake', value: stats.wake, key: 'wake'}
    ]
    return (
      <div>
        <h1 className="stats--date">{startDate} - {endDate}</h1>
        <div className="stats">
          <div className="stats--stats-container">
              {statCollection.map(this.createStat)}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = RangeStats;
