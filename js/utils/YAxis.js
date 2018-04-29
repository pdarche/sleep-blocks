'use strict'


function YAxis(displaySize, xOffset, zOffset, tickCount, pxPerMin, scale) {
  this.displaySize = displaySize;
  this.xOffset = xOffset;
  this.zOffset = zOffset;
  this.tickCount = tickCount;
  this.pxPerMin = pxPerMin;
  this.scale = scale;
  this._threeObj = this.create()
  this.labels = this.labels()
}

YAxis.prototype.create = function() {
    var time = new THREE.Geometry();
    time.vertices.push(new THREE.Vector3(this.xOffset, 0, this.zOffset));
    time.vertices.push(new THREE.Vector3(this.displaySize + this.xOffset, 0, this.zOffset));

    for (var t = 0; t < this.tickCount; t++) {
      var xPos = this.scale(t * 3600) + this.xOffset // Note: tighlty coupled to hour ticks only
      time.vertices.push(new THREE.Vector3(xPos, 0, this.zOffset));
      time.vertices.push(new THREE.Vector3(xPos, 0, this.zOffset - 15));
    }

    var material = new THREE.LineBasicMaterial({
      color: 0x000000,
      opacity: 1,
      visible : true
    });

    var tLine = new THREE.LineSegments(time, material);
    return tLine
}

YAxis.prototype.labels = function() {
    var canvas = document.createElement('canvas')
    var context = canvas.getContext('2d')
    canvas.height = this.displaySize * 2
    canvas.width = 150
    context.font = "48px Arial";

    var hrs = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    for (var t = 1; t < hrs.length-1; t++) {
      var xPos = this.scale(t * 3600) + this.xOffset
      context.fillText(hrs[t]+ ':00', 30, canvas.height/2 - xPos * 2 - 20);
    }

    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(canvas.width/2, canvas.height/2),
      material
    )
    mesh.position.set(-20, 0, this.zOffset - canvas.width/2)
    mesh.rotation.set(-Math.PI / 2, 0, -Math.PI / 2)
    return mesh
}

module.exports = YAxis;

