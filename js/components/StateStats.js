'use strict';

/*
* Sleep state statistics
*
*/

var Utils = require('../utils/Utils');
var moment = require('moment');

var StateStats = React.createClass({
  formatDate: function(date){
    return moment(date).format('LL');
  },

  formatValue: function(mins){
    return moment.duration(mins, 'minutes').humanize();
  },

  formatState: function(state) {
    var state = Utils.toTitleCase(state)
    if (state !== 'Wake') {
      state += " Sleep"
    } else {
      state = "Awake"
    }
    return state
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
        <div className={className}></div>
      </div>
    );
  },

  render: function() {
    var stats = Utils.computeStateStats(this.props.nights, this.props.state);
    var statCollection = [
       {name: 'Average', value: this.formatValue(stats.mean)},
       {name: 'Max', value: this.formatValue(stats.max.value)},
       {name: 'Min', value: this.formatValue(stats.min.value)}
    ]

    return (
      <div>
        <h1 className="stats--date">{this.formatState(this.props.state)}</h1>
        <div className="stats">
          <div className="stats--stats-container">
              {statCollection.map(this.createStat)}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = StateStats;
