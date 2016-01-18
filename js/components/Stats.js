'use strict';

/*
* Descriptive statistics view
*
*/

var SingleNightStats = require('./SingleNightStats');
var StateStats = require('./StateStats');
var TimeStats = require('./TimeStats');

var Stats = React.createClass({
  render: function() {
    var stats;

    switch (this.props.statsType) {
      case 'night':
        stats = <SingleNightStats night={this.props.night}/>;
        break;
      case 'state':
        stats = <StateStats nights={this.props.nights} state={this.props.state}/>;
        break;
      case 'time':
        stats = <TimeStats nights={this.props.nights} time={this.props.time}/>
        break;
    }

    return (
      <div>{stats}</div>
    );
  }
});

module.exports = Stats;