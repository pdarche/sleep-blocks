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

    if (this.props.night){
      stats = <SingleNightStats night={this.props.night}/>
    }

    return (
      <div>{stats}</div>
    );
  }
});

module.exports = Stats;