'use strict';

/*
* Single night statistics
*
*/

var moment = require('moment');
var Utils = require('../utils/Utils');


var SingleNightStats = React.createClass({
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
        </div>
      </div>
    );
  },


  render: function() {
    var night = this.props.night;
    var date = night.dateObj.format('LL');
    var statCollection = [
      {name: 'Bedtime', value: moment(night.bedTime).format('h:mm a'), key: 'risetime', unit: ''},
      {name: 'Risetime', value: moment(night.riseTime).format('h:mm a'), key: 'bedtime', unit: ''},
      {name: 'Time Asleep', value: Utils.formatTime(night.totalZ), key: 'sleep', unit: ''},
      {name: 'Light Sleep', value: Utils.formatTime(night.timeInLight), key: 'light', unit: ''},
      {name: 'Deep Sleep', value: Utils.formatTime(night.timeInDeep), key: 'deep'},
      {name: 'REM Sleep', value: Utils.formatTime(night.timeInRem), key: 'rem'},
      {name: 'Time Awake', value: Utils.formatTime(night.timeInWake), key: 'wake'}
    ];

    return (
      <div>
        <h1 className="stats--date">{date}</h1>
        <div className="stats">
          <div className="stats--stats-container">
              {statCollection.map(this.createStat)}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = SingleNightStats;
