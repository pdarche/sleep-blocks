'use strict';

/*
* Control view
*
*/

var moment = require('moment');

var Controls = React.createClass({
  handleViewChange: function(ev) {
    this.props.handleViewChange(ev.target.id);                
  },

  handleDateHover: function(ev){
    this.props.handleNightHover(ev.target.id);
  },

  handleStateHover: function(ev){
    this.props.handleStateHover(ev.target.id);
  },

  handleTimeHover: function(ev){
    this.props.handleTimeHover(ev.target.id);
  },

  render: function() {
    var self = this;
    // var nights = this.props.nights.map(function(night){
    //   var date = moment(night.startDate).format('L');
    //   return <div className="day" id={night.id} onMouseOver={self.handleDateHover} >{date}</div>
    // });
    var nights = [];

    return (
      <div id="controls">
        <h2>View</h2>
        <div className="views">
          <div className="view overhead" id="overhead" onClick={this.handleViewChange}>overhead</div>
          <div className="view front" id="front" onClick={this.handleViewChange}>front</div>
          <div className="view overview" id="overview" onClick={this.handleViewChange}>overview</div>
        </div>

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

