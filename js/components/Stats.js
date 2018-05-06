'use strict';

/*
* Descriptive statistics view
*
*/

var SingleNightStats = require('./SingleNightStats');
var StateStats = require('./StateStats');
var TimeStats = require('./TimeStats');
var RangeStats = require('./RangeStats');

var Stats = React.createClass({
  createStats: function() {
    var stats;
    switch (this.props.statsState) {
      case 'night':
        stats = <SingleNightStats night={this.props.night}/>;
        break;
      case 'state':
        stats = <StateStats nights={this.props.activeNights} state={this.props.state}/>;
        break;
      case 'time':
        stats = <TimeStats nights={this.props.activeNights} time={this.props.time}/>
        break;
      case 'range':
        stats = <RangeStats nights={this.props.activeNights} />
    }
    return stats
  },

  render: function() {
    return (
      <div id="stats">{this.createStats()}</div>
    );
  }
});

module.exports = Stats;
