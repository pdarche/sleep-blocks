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
        <table>
          <tr>
            <td className="stats--stat">Avg</td>
            <td className="stats--value">{stats.mean}</td>
          </tr>
          <tr>
            <td className="stats--stat">Max</td>
            <td className="stats--value">{this.formatTime(stats.max.value)} on {this.formatDate(stats.max.date)}</td>
          </tr>
          <tr>
            <td className="stats--stat">Min</td>
            <td className="stats--value">{this.formatTime(stats.min.value)} on {this.formatDate(stats.min.date)}</td>
          </tr>
        </table>
      </div>
    );
  }
});

module.exports = TimeStats;