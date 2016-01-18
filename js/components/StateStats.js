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
    if (state !== 'wake') {
      state += " Sleep"
    }

    return state
  },

  render: function(){
    var stats = Utils.computeStateStats(this.props.nights, this.props.state);

    return (
      <div className="stats">
        <h1 className="stats--date">{this.formatState(this.props.state)} </h1>
        <div className="stats--container">
          <div className="stat">Avg: {this.formatValue(stats.mean)} </div>
          <div className="stat">
            Max: {this.formatValue(stats.max.value)} on {this.formatDate(stats.max.date)}
          </div>
          <div className="stat">
            Min: {this.formatValue(stats.min.value)} on {this.formatDate(stats.min.date)}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = StateStats;