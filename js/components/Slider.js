'use strict';


var d3 = require('d3');
var moment = require('moment');

var Slider = React.createClass({
  previousValue: 0,

  componentDidMount: function(){
    var self = this;
    var formatDate = d3.time.format("%b %d");
    var startDate = moment(this.props.nights[0].startDate);
    var endDate = moment(this.props.nights[this.props.nights.length - 1].startDate);

    // parameters
    var margin = {top: 20, right: 50, bottom: 20, left: 50},
      width = 960 - margin.left - margin.right,
      height = 100 - margin.bottom - margin.top;

    var timeScale = d3.time.scale()
      .domain([startDate, endDate])
      .range([0, width])
      .clamp(true);

    // defines brush
    var brush = d3.svg.brush()
      .x(timeScale)
      .extent([startDate, startDate])
      .on("brush", brushed);

    var svg = d3.select("#slider").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      // classic transform to position g
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
      .attr("class", "x axis")
    // put in middle of screen
    .attr("transform", "translate(0," + height / 2 + ")")
    // inroduce axis
    .call(d3.svg.axis()
      .scale(timeScale)
      .orient("bottom")
      .tickFormat(function(d) {
        return formatDate(d);
      })
      .tickSize(0)
      .tickPadding(12)
      .tickValues([timeScale.domain()[0], timeScale.domain()[1]]))
      .select(".domain")
      .select(function() {
        return this.parentNode.appendChild(this.cloneNode(true));
      })
      .attr("class", "halo");

    // slider
    var slider = svg.append("g")
      .attr("class", "slider")
      .call(brush);

    // slider.selectAll(".extent, .resize")
    //   .remove();

    slider.select(".background")
      .attr("height", height);

    var handle = slider.append("g")
      .attr("class", "handle")

    handle.append("path")
      .attr("transform", "translate(0," + height / 3 + ")")
      .attr("d", "M 0 -20 V 20")

    handle.append('text')
      .text(startDate)
      .attr("transform", "translate(" + (-18) + " ," + (height / 2 - 25) + ")");

    slider.call(brush.event);

    function brushed() {
      var value = brush.extent()[0];
      var newValue;

      if (d3.event.sourceEvent) { // not a programmatic event
        value = timeScale.invert(d3.mouse(this)[0]);
        brush.extent([value, value]);
        newValue = timeScale(value) - self.previousValue;

        self.previousValue = timeScale(value);
        // self.props.handleSliderMovement(newValue)
        self.props.handleSliderMovement(timeScale(value));
      }

      handle.attr("transform", "translate(" + timeScale(value) + ",0)");
      handle.select('text').text(formatDate(value));
    }
  },

  onMouseOver: function(){
    this.props.handleSliderHover();
  },

  render: function(){
    return (<div id="slider" onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOver}></div>);
  }
});

module.exports = Slider;

