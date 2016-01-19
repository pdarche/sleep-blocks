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
    return moment(time).format('LTS');
  },

  render: function(){
    var stats = Utils.computeTimeStats(this.props.nights, this.props.time);

    return (
      <div className="stats">
        <h1 className="stats--date">{Utils.toTitleCase(this.props.time)} </h1>
        <div className="stats--container">
          <div className="stat">Avg: {stats.mean} </div>
          <div className="stat">
            Max: {this.formatTime(stats.max.value)} on {this.formatDate(stats.max.date)}
          </div>
          <div className="stat">
            Min: {this.formatTime(stats.min.value)} on {this.formatDate(stats.min.date)}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = TimeStats;