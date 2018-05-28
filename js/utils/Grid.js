'use strict';

var _ = require('lodash');
var moment = require('moment');

function Grid(step, size) {
  this.step = step
  this.size = size
}

Grid.prototype.createGrid = function() {
  var gridGeom = new THREE.Geometry();

  for (var i = -this.size/2; i <= this.size/2; i += this.step) {
    gridGeom.vertices.push(new THREE.Vector3(-this.size/2, 0, i));
    gridGeom.vertices.push(new THREE.Vector3(this.size/2, 0, i));
  }

  for (var j = -(this.size/2); j <= this.size/2; j += this.step) {
    gridGeom.vertices.push(new THREE.Vector3(j, 0, -(this.size/2)));
    gridGeom.vertices.push(new THREE.Vector3(j, 0, this.size/2));
  }

  var gridMat = new THREE.LineBasicMaterial({
    color: 0x000000,
    opacity: 0.2,
    visible : true
  });
  var gridLines = new THREE.LineSegments(gridGeom, gridMat);

  return gridLines
}

Grid.prototype.gridLines = function(scale, nTicks, offset) {
  var gridGeom = new THREE.Geometry();

  for (var i = 1; i <= nTicks; i++) {
    var xPos = scale(i * 3600) + offset
    gridGeom.vertices.push(new THREE.Vector3(xPos, 0, offset));
    gridGeom.vertices.push(new THREE.Vector3(xPos, 0, this.size / 2));
  }

  for (var i = 1; i <= nTicks; i++) {
    var xPos = scale(i * 3600) + offset
    gridGeom.vertices.push(new THREE.Vector3(xPos, 0, offset));
    gridGeom.vertices.push(new THREE.Vector3(xPos, 0, this.size / 2));
  }

  var gridMat = new THREE.LineBasicMaterial({
    color: 0x000000,
    opacity: 0.2,
    visible : true
  });
  var gridLines = new THREE.LineSegments(gridGeom, gridMat);

  return gridLines
}

module.exports = Grid;

