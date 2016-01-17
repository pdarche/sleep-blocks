'use strict';

var moment = require('moment');

/*
* Descriptive statistics view
*
*/

var Stats = React.createClass({
  createTime: function(time){
    var time = moment.duration(time, 'minutes').asHours()
    return Math.round(time * 100) / 100
  },

  render: function() {
    var night = this.props.night;
    var date = moment(night.startDate).format('LL');

    return (
      <div className="stats">
        <h1 className="stats--date">{date}</h1>
        <div className="stat"> Bedtime {moment(night.bedTime).format('LTS')}</div>
        <div className="stat">Risetime {moment(night.riseTime).format('LTS')}</div>
        <div className="stats--container">
          <div className="stat"> Total Sleep {this.createTime(night.totalZ)} hrs</div>
          <div className="stat">Light Sleep {this.createTime(night.timeInLight)} hrs</div>
          <div className="stat">Deep Sleep {this.createTime(night.timeInDeep)} hrs</div>
          <div className="stat">REM Sleep {this.createTime(night.timeInRem)} hrs</div>
          <div className="stat">Wake Sleep {this.createTime(night.timeInWake)} hrs</div>
        </div>
      </div>
    );
  }
});

module.exports = Stats;