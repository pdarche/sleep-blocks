'use strict';

/*
* Control view
*
*/

var moment = require('moment');

var Controls = React.createClass({
  handleDateHover: function(ev){
    this.props.handleNightHover(ev.target.id);
  },

  handleStateHover: function(ev){
    this.props.handleStateHover(ev.target.id);
  },

  handleTimeHover: function(ev){
    console.log('the event is', ev)
    this.props.handleTimeHover(ev.target.id);
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
          <div className="time bedtime" id="bedtime" onClick={this.handleTimeHover}>bedtime</div>
          <div className="time risetime" id="risetime" onClick={this.handleTimeHover}>risetime</div>
        </div>

        <h2>Sleep State</h2>
        <div className="sleep-states">
          <div className="state light" id="light" onClick={this.handleStateHover}>Light</div>
          <div className="state deep" id="deep" onClick={this.handleStateHover}>Deep</div>
          <div className="state rem" id="rem" onClick={this.handleStateHover}>REM</div>
          <div className="state wake" id="wake" onClick={this.handleStateHover}>Wake</div>
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

