'use strict'


function Axis(dateRange, xOffset, displaySize, dateScale, nightSpacing, numNights) {
  this.dateRange = dateRange;
  this.xOffset = xOffset;
  this.displaySize = displaySize;
  this.dateScale = dateScale;
  this.nightSpacing = nightSpacing;
  this.numNights = numNights;
  this._threeObj = this.create()
  this.labels = this.labels()
}

Axis.prototype.create = function() {
  var days = new THREE.Geometry();
  days.vertices.push(new THREE.Vector3(0, 0, 0));
  days.vertices.push(new THREE.Vector3(0, 0, 1600));

  //for (var i = 0; i <= this.dateRange.length; i++) {
  //  var date = this.dateRange[i];
  //  var zPos = this.dateScale(date);
  //  days.vertices.push(new THREE.Vector3(0, 0, zPos));
  //  days.vertices.push(new THREE.Vector3(-10, 0, zPos));
  //}

  var material = new THREE.LineBasicMaterial({
    color: 0x000000,
    opacity: 1,
    visible : true
  });

  var xTicks = new THREE.LineSegments(days, material);
  xTicks.applyMatrix(new THREE.Matrix4().makeTranslation(this.xOffset, 0, -740));

  return xTicks
}

Axis.prototype.labels = function() {
  var canvas = document.createElement('canvas')
  var context = canvas.getContext('2d')
  var height = this.dateScale(this.dateRange[this.dateRange.length-1]) * 2;
  canvas.height = height;
  canvas.width = 150
  context.font = "24px Arial";

  for (var d = 0; d < this.dateRange.length; d++) {
    var date = this.dateRange[d]
    var zPos = this.dateScale(date) * 2;
    context.fillText(date.format('LL'), 10, canvas.height - zPos);
  }
  var texture = new THREE.Texture(canvas)
  texture.needsUpdate = true;

  var material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide
  });
  material.transparent = false

  var mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(canvas.width, canvas.height),
    material
  );
  mesh.position.set(0, 0, 0)
  var translation = new THREE.Matrix4().makeTranslation(-this.xOffset + (canvas.width/2) + 10, -(canvas.height + this.displaySize) + 30, 0)
  mesh.geometry.applyMatrix(translation);
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = -Math.PI;

  return mesh
}

module.exports = Axis;
