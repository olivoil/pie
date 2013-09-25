
/**
 * Dependencies.
 */

var raf = require('raf')
  , ease = require('ease')
  , autoscale = require('autoscale-canvas');

/**
 * Expose `Pie`.
 */

module.exports = Pie;

/**
 * Initialize a new `Pie`.
 */

function Pie(){
  this.segments = [];
  this.el = document.createElement('canvas');
  this.ctx = this.el.getContext('2d');
  this.easing('outBounce');
  this.rotate(true).scale(false);
  this.size(50);
}

/**
 * Set pie ease function to `easing`.
 *
 * @param {String} easing
 * @return {Pie}
 * @api public
 */

Pie.prototype.easing = function(easing){
  this._easing = easing;
  return this;
}

/**
 * Animate by rotating pie.
 *
 * @param {Boolean} rotate
 * @return {Pie}
 * @api public
 */

Pie.prototype.rotate = function(rotate){
  this._rotate = !!rotate;
  return this;
}

/**
 * Animate by scaling pie.
 *
 * @param {Boolean} scale
 * @return {Pie}
 * @api public
 */

Pie.prototype.scale = function(scale){
  this._scale = !!scale;
  return this;
}

/**
 * Set pie size to `n`.
 *
 * @param {Number} n
 * @return {Pie}
 * @api public
 */

Pie.prototype.size = function(n){
  this.el.width = n;
  this.el.height = n;
  autoscale(this.el);
  return this;
};

/**
 * Update segments to `data`.
 *
 * @param {Object[]} segments with `value`, and `color`
 * @return {Pie}
 * @api public
 */

Pie.prototype.update = function(segments, scale, rotate){
  this.segments = segments;
  this.draw(this.ctx, scale, rotate);
  return this;
};


/**
 * Animate segments.
 *
 * @param {Object[]} segments with `value`, and `color`
 * @param {String} easing
 * @param {Boolean} rotate
 * @param {Boolean} scale
 * @return {Pie}
 * @api public
 */

Pie.prototype.animate = function(segments){
  var self = this;
  if(typeof rotate == 'undefined') rotate = true;
  raf.cancel(self.animation);

  var duration = 2000
    , start = Date.now()
    , end = start + duration

  function step(){
    self.animation = raf(function(){
      var now = Date.now();
      if (now - start >= duration) return self.update(segments);
      var p = (now - start) / duration;
      var val = ease[self._easing](p);
      self.update(segments, self._rotate && val, self._scale && val);
      step();
    });
  }

  step();
  return this;
}

/**
 * Draw on `ctx`.
 *
 * @param {CanvasRenderingContext2d} ctx
 * @param {Number} rotate ratio
 * @param {Number} scale ratio
 * @return {Pie}
 * @api private
 */

Pie.prototype.draw = function(ctx, rotate, scale){
  var ratio = window.devicePixelRatio || 1
    , size = this.el.width / ratio
    , half = size / 2
    , x = half
    , y = half
    , rad = half - 1
    , rotate = rotate || 1
    , scale = scale || 1
    , strokeWidth = 2
    , strokeColor = '#fff';

  var total = this.segments.reduce(function(sum, segment){
    return sum + segment.value;
  }, 0);

  var start = 1.5 * Math.PI;

  ctx.clearRect(0, 0, size, size);

  this.segments.forEach(function(segment){
    var angle = rotate * (segment.value/total) * (Math.PI*2);
    ctx.beginPath();
    ctx.arc(x, y, scale * rad, start, start + angle);
    ctx.lineTo(rad,rad);
    ctx.closePath();
    ctx.fillStyle = segment.color;
    ctx.fill();

    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    start += angle;
  });

  return this;
};
