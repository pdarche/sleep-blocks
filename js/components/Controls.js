'use strict';

/*
* Control view
*
*/

var moment = require('moment');

var Controls = React.createClass({
  handleDateHover: function(ev){
    var targetNight = ev.target.id;
    this.props.handleNightHover(targetNight);
  },

  render: function() {
    var self = this;
    var nights = this.props.nights.map(function(night){
      var date = moment(night.startDate).format('L');
      return <div className="day" id={night.id} onMouseOver={self.handleDateHover} >{date}</div>
    });

    return (
      <div id="controls">
        <h2>Times</h2>
        <div className="times">
          <div className="time bedtime">bedtime</div>
          <div className="time risetime">risetime</div>
        </div>

        <h2>Sleep State</h2>
        <div className="sleep-states">
          <div className="state">Light</div>
          <div className="state">Deep</div>
          <div className="state">REM</div>
          <div className="state">Wake</div>
        </div>

        <h2>Nights</h2>
        <div className="nights">
          {nights}
        </div>
      </div>
    );
  }
});

module.exports = Controls;