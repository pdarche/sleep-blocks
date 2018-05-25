'use strict';

/*
* Date slider component
*
*/

var moment = require('moment');

var Slider = React.createClass({
  previousValue: 0,

  componentDidMount: function() {
    var self = this;
    var formatDate = d3.time.format("%b %d");

    // Parameters
    var margin = {top: 20, right: 50, bottom: 20, left: 50},
      width = (.9 * window.innerWidth) - margin.left - margin.right,
      height = 60 - margin.bottom - margin.top;

    // Timescale
    var timeScale = d3.time.scale()
      .domain([this.props.dateRange[0], this.props.dateRange[this.props.dateRange.length-1]])
      .range([0, width])
      .clamp(true);

    // Offset scale (what is this?)
    var offsetScale = d3.scale.linear()
      .domain([0, width])
      .range([0, this.props.dateRange.length - 1])
      .clamp(true)

    // Initialize brush
    var brush = d3.svg.brush()
      .x(timeScale)
      .extent([this.props.startDate, this.props.startDate])
      .on("brush", brushed);

    var svg = d3.select("#slider").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // X Axis
    var xAxis = d3.svg.axis()
        .scale(timeScale)
        .orient("bottom")
        .ticks(10)
        //.tickSize(0)
        .tickPadding(10)

    // What is this
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height / 2 + ")")
      .call(xAxis)
      .select(".domain")
      .select(function() {
        return this.parentNode.appendChild(this.cloneNode(true))
      })
      .attr("class", "halo");

    d3.selectAll('.x text')
      .attr("transform", "translate(0, -5)")

    // Slider
    var slider = svg.append("g")
      .attr("class", "slider")
      .call(brush);

    //slider.selectAll(".extent, .resize")
    //   .remove();

    slider.select(".background")
      .attr("height", height);

    var handle = slider.append("g")
      .attr("class", "handle")

    // This is where the stupid handle is
    handle.append("path")
      .attr("class", "handle-path")
      .attr("transform", "translate(0, 10)")
      .attr("d", "M 0 -7 V 0")


    handle.append('text')
      .attr("class", "current-date")
      .attr("transform", "translate(0, -5)")
      .text(this.props.startDate.format('MMM DD'))

    function brushed(ev) {
      var value = brush.extent()[0];
      var offset;
      if (d3.event.sourceEvent) { // not a programmatic event
        value = timeScale.invert(d3.mouse(this)[0]);
        offset = offsetScale(d3.mouse(this)[0])
        brush.extent([value, value]);
        self.previousValue = offset;
        self.props.handleSliderMovement(offset);
      }
      handle.attr("transform", "translate(" + timeScale(value) + ",0)");
      handle.select('text').text(formatDate(value));
    }
  },

  onMouseOver: function() {
    this.props.handleMouseOver();
  },

  onMouseOut: function() {
    this.props.handleMouseOut();
  },

  render: function(){
    return (
      <div id="slider"
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}>
      </div>
    );
  }
});

module.exports = Slider;


