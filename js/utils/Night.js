'use strict';

var moment = require('moment');

var SLEEP_STATES = {
  "UNDEFINED": { "height" : 0, "color" : 0x236167, arr : [] },
  "LIGHT": { "height" : 100, "color" : 0x28774F, arr : [] },
  "DEEP": { "height" : 40, "color" : 0x373276, arr : [] },
  "REM": { "height" : 70, "color" : 0xA2A838, arr : [] },
  "WAKE": { "height" : 120, "color" : 0x9F5B46, arr : [] }
}


function Night(data, blockWidth, nightSpacing, xOffset, zOffset, scale, dateScale) {
  this.data = data;
  this.blockWidth = blockWidth;
  this.nightSpacing = nightSpacing;
  this.xOffset = xOffset;
  this.zOffset = zOffset;
  this.scale = scale;
  this.dateScale = dateScale;

  this._threeObj = this.create();
}

Night.prototype.create = function() {
   var bedTime = this.scale(this.data.translatedBedTime);
   var night = new THREE.Object3D();

   for (var i = 0; i < this.data.sleepGraph.length; i++){
     // create the material for the sleep block
     var state = this.data.sleepGraph[i];
     var geometry = new THREE.BoxGeometry(
         (.8 * this.blockWidth),
         SLEEP_STATES[state].height,
         this.blockWidth
     );
     var material = new THREE.MeshPhongMaterial({
       color: SLEEP_STATES[state].color,
       wireframe: false,
       transparent: true
     });

     // Position the sleep block
     var rect = new THREE.Mesh(geometry, material);
     rect.position.x = ((i * this.blockWidth) + bedTime) + this.xOffset;
     rect.position.y = 0;
     rect.position.z = this.dateScale(this.data.dateObj) + (2 * this.nightSpacing) + this.zOffset;
     rect.translateY(SLEEP_STATES[state].height/2);
     rect.updateMatrix();
     rect.state = state

     // add to night object
     if (state !== "UNDEFINED") {
       night.add(rect);
     }
   }
   night.dateObj = this.data.dateObj;

   return night
}

Night.prototype.highlightState = function(targetState) {
  this._threeObj.children.forEach(function(block){
    if (block.state === targetState) {
      block.material.opacity = 1;
    } else {
      block.material.opacity = .01;
    }
  });
}

Night.prototype.highlightTime = function(time) {
  var targetIndex = time === 'risetime'
    ? this._threeObj.children.length - 1
    : 0;

  this._threeObj.children.forEach(function(block, ix) {
    if (ix !== targetIndex) {
      block.material.opacity = .01;
    }
  });
}

Night.prototype.offset = function(dateOffset, startDate, endDate) {
   // Update the night's position
   var absPos = this.dateScale(this._threeObj.dateObj)
   var newPos = absPos - (dateOffset * 2 * this.nightSpacing)
   this._threeObj.position.z = newPos;

   // Update the night's visibility
   if (moment(this._threeObj.dateObj).isBefore(startDate) ||
       moment(this._threeObj.dateObj).isAfter(endDate)) {
     this._threeObj.visible = false;
   } else {
     this._threeObj.visible = true;
   }

}

Night.prototype.setOpacity = function(opacity) {
  this._threeObj.children.forEach(function(block){
    block.material.opacity = opacity;
  });
}

module.exports = Night;
