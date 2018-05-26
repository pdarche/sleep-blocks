'use strict';

/*
* Sleep time (bed / awake) statistics
*
*/

var Utils = require('../utils/Utils');
var moment = require('moment');

var TimeStats = React.createClass({

  formatDate: function(date){
    return moment(date).format('LL');
  },

  formatTime: function(time){
    return moment(time).format('h:mm a');
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

  render: function(){
    var stats = Utils.computeTimeStats(this.props.nights, this.props.time);
    var statCollection = [
       {name: 'Average', value: stats.mean},
       {name: 'Max', value: this.formatTime(stats.max.value)},
       {name: 'Min', value: this.formatTime(stats.min.value)}
    ]

    return (
      <div>
        <h1 className="stats--date">{Utils.toTitleCase(this.props.time)} </h1>
        <div className="stats">
          <div className="stats--stats-container">
              {statCollection.map(this.createStat)}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = TimeStats;
