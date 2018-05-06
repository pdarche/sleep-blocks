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
        <h4 className="stats--date">{this.formatState(this.props.state)} </h4>
        <table>
          <tr>
            <td className="stats--stat">Avg</td>
            <td className="stats--value">{this.formatValue(stats.mean)}</td>
          </tr>
          <tr>
            <td className="stats--stat">Max</td>
            <td className="stats--value">{this.formatValue(stats.max.value)} on {this.formatDate(stats.max.date)}</td>
          </tr>
          <tr>
            <td className="stats--stat">Min</td>
            <td className="stats--value">{this.formatValue(stats.min.value)} on {this.formatDate(stats.min.date)}</td>
          </tr>
        </table>
      </div>
    );
  }
});

module.exports = StateStats;
