'use strict';

/*
* Single night statistics
*
*/

var moment = require('moment');

var SingleNightStats = React.createClass({
  createTime: function(time){
    var time = moment.duration(time, 'minutes').asHours()
    return Math.round(time * 100) / 100
  },

  render: function(){
    var night = this.props.night;
    var date = moment(night.startDate).format('LL');

    return (
      <div className="stats">
        <h4 className="stats--date">{date}</h4>
        <table>
          <tbody>
            <tr>
              <td className="stats--stat">Bedtime</td>
              <td className="stats--value">{moment(night.bedTime).format('LT')}</td>
            </tr>
            <tr>
              <td className="stats--stat">Risetime</td>
              <td className="stats--value">{moment(night.riseTime).format('LT')}</td>
            </tr>
            <tr>
              <td className="stats--stat">Total Sleep</td>
              <td className="stats--value">{this.createTime(night.totalZ)} hrs</td>
            </tr>
            <tr>
              <td className="stats--stat">Light Sleep</td>
              <td className="stats--value">{this.createTime(night.timeInLight)} hrs</td>
            </tr>
            <tr>
              <td className="stats--stat">Deep Sleep</td>
              <td className="stats--value">{this.createTime(night.timeInDeep)} hrs</td>
            </tr>
            <tr>
              <td className="stats--stat">REM Sleep</td>
              <td className="stats--value">{this.createTime(night.timeInRem)} hrs</td>
            </tr>
            <tr>
              <td className="stats--stat">Time Awake</td>
              <td className="stats--value">{this.createTime(night.timeInWake)} hrs</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = SingleNightStats;
