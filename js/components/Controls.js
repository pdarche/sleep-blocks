/*
* Control view
*
*/

var Controls = React.createClass({
  render: function() {
    var nights = this.props.nights.map(function(night){
    var date = night.startDate.month + '/' + night.startDate.day + '/' + night.startDate.year;

      return <div className="day">{date}</div>
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
          <div className="state">Wak</div>
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