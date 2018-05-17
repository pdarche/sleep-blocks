'use strict'


var SparkLine = React.createClass({
  getInitialState: function() {
    return {
      loaded: false
    }
  },

  componentDidUpdate: function() {
    var width = 150;
    var height = 25;
    var scales = this.scales(this.props.dateRange, width, height)
    var data = this.props.data;
    scales.y.domain(d3.extent(data, function(d) {
      return d.value;
    }));

    if (data.length && !this.state.loaded) {
      var line = d3.svg.line()
        .x(function(d) { return scales.x(d.date); })
        .y(function(d) { return scales.y(d.value); });

      var id = '#id_' + this.props.stat
      var cls = 'stat-' + this.props.stat
      d3.select(id)
        .append('svg')
        .attr('class', cls)
        .attr('width', width)
        .attr('height', height)
        .append('path')
        .datum(data)
        .attr('class', 'sparkline')
        .attr('d', line)
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('stroke-width', 1);

      d3.select('.' + cls)
        .append('line')
        .attr('stroke-width', 1)
        .attr('stroke', 'black')

      this.setState({loaded: true});
    } else if (data.length) {
      this.update(scales, height);
    }

  },

  update: function(scales, height) {
    var id = '#id_' + this.props.stat
    d3.selectAll(id + ' line')
      .datum(this.props.data[this.props.offset])
      .attr('x1', function(d) { return scales.x(d.date) })
      .attr('x2', function(d) { return scales.x(d.date) })
      .attr('y2', function(d) { return scales.y(d.value) })
      .attr('y1', height)
  },

  scales: function(dr, width, height) {
    var x = d3.time.scale()
      .domain([dr[0], dr[dr.length-1]])
      .range([0, width]);

    var y = d3.scale.linear()
      .range([height, 0]);

    return {
      x: x,
      y: y
    }
  },

  render: function() {
    return (
      <div id={"id_" + this.props.stat} className="sparkline-chart"></div>
    );
  }
});

module.exports = SparkLine;
