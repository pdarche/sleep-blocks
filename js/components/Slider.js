'use strict';


var d3 = require('d3');
var moment = require('moment');

var Slider = React.createClass({
  previousValue: 0,

  componentDidMount: function() {
    var self = this;
    var formatDate = d3.time.format("%b %d");
    var startDate = moment(this.props.nights[0].startDate);
    var endDate = moment(this.props.nights[this.props.nights.length - 1].startDate);

    // Parameters
    var margin = {top: 20, right: 50, bottom: 20, left: 50},
      width = window.innerWidth - margin.left - margin.right,
      height = 100 - margin.bottom - margin.top;

    var timeScale = d3.time.scale()
      .domain([startDate, endDate])
      .range([0, width])
      .clamp(true);

    var offsetScale = d3.scale.linear()
      .domain([0, width])
      .range([0, 299]) // TODO: change to number of nights 
      .clamp(true)

    // Define brush
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
        .tickSize(0)
      //.tickFormat(function(d) { return formatDate(d); })
      //.tickPadding(12))
      //.tickValues([timeScale.domain()[0], timeScale.domain()[1]]))

    svg.append("g")
      .attr("class", "x axis")
    .attr("transform", "translate(0," + height / 2 + ")")     
    .call(xAxis)
      .select(".domain")
      .select(function() {
        return this.parentNode.appendChild(this.cloneNode(true))
      })
      .attr("class", "halo");

    // Slider
    var slider = svg.append("g")
      .attr("class", "slider")
      .call(brush);

    // slider.selectAll(".extent, .resize")
    //   .remove();

    slider.select(".background")
      .attr("height", height);

    var handle = slider.append("g")
      .attr("class", "handle")

    // TODO: change!  This is where the stupid handle is
    handle.append("path")
      .attr("transform", "translate(0," + 30 + ")")
      .attr("d", "M 0 -10 V 10")

    handle.append('text')
      .attr("class", "current-date")
      .attr("transform", "translate(0, 10)")
      .text(startDate)

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
    return (<div id="slider" onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOver}></div>);
  }
});

module.exports = Slider;

