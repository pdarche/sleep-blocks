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
    var startDate = moment(this.props.nights[0].startDate);
    var endDate = moment(this.props.nights[this.props.numNights].startDate);

    // Parameters
    var margin = {top: 20, right: 50, bottom: 20, left: 50},
      width = window.innerWidth - margin.left - margin.right,
      height = 60 - margin.bottom - margin.top;

    var timeScale = d3.time.scale()
      .domain([startDate, endDate])
      .range([0, width])
      .clamp(true);

    var offsetScale = d3.scale.linear()
      .domain([0, width])
      .range([0, this.props.dateRange.length - 1])
      .clamp(true)

    // Initialize brush
    var brush = d3.svg.brush()
      .x(timeScale)
      .extent([startDate, startDate])
      .on("brush", brushed);

    var svg = d3.select("#slider").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxis = d3.svg.axis()
        .scale(timeScale)
        .orient("bottom")
        .ticks(10)
        .tickSize(0)
        .tickPadding(10)

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height / 2 + ")")
      .call(xAxis)
      .select(".domain")
      .select(function() {
        return this.parentNode.appendChild(this.cloneNode(true))
      })
      .attr("class", "halo");

    //svg.selectAll(".axis g")
    //  .attr("transform", "translate(0,-3)")

    // Slider
    var slider = svg.append("g")
      .attr("class", "slider")
      .call(brush);

    slider.selectAll(".extent, .resize")
       .remove();

    slider.select(".background")
      .attr("height", height);

    var handle = slider.append("g")
      .attr("class", "handle")

    // TODO: change!  This is where the stupid handle is
    handle.append("path")
      .attr("class", "handle-path")
      .attr("transform", "translate(0, 10)")
      .attr("d", "M 0 -5 V 0")

    handle.append('text')
      .attr("class", "current-date")
      .attr("transform", "translate(0, 0)")
      .text(startDate.format('MMM DD'))

    // Axis for night highlighting
    //var hoverAxis = d3.svg.axis()
    //    .scale(timeScale)
    //    .orient("bottom")
    //    .ticks(this.props.dateRange.length - 1)
    //    .tickSize(-8)
    //
    //svg.append("g")
    //  .attr("class", "x axis hover")
    //  .attr("transform", "translate(0," + height / 2 + ")")
    //  .call(hoverAxis)
    //
    //d3.selectAll(".hover line").on('mouseover', function(d, ix){
    //    // add check for if mouse is down.  if it is don't do antyhing
    //    self.props.handleNightHover(ix, d)
    //    d3.select(this)
    //      .style('opacity', 1)
    //    d3.select(this.parentNode).select('text').style('opacity', 1)
    //  })
    //  .on('mouseout', function(d, ix) {
    //    d3.select(this)
    //      .style('opacity', .1)
    //    d3.select(this.parentNode).select('text').style('opacity', 0)
    //  })

    slider.call(brush.event);

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
    this.props.handleSliderHover();
  },

  render: function(){
    return (
      <div id="slider"
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOver}></div>
    );
  }
});

module.exports = Slider;


