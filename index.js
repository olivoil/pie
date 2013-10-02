
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
  this.fontSize(24);
  this.color('rgba(31,190,242,1)');
  this.font('helvetica, arial, sans-serif');
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
 * Set font size to `n`.
 *
 * @param {Number} n
 * @return {Pie}
 * @api public
 */

Pie.prototype.fontSize = function(n){
  this._fontSize = n;
  return this;
};

/**
 * Set text color to `str`.
 *
 * @param {String} str
 * @return {Pie}
 * @api public
 */

Pie.prototype.color = function(str){
  this._color = str;
  return this;
}

/**
 * Set font `family`.
 *
 * @param {String} family
 * @return {Pie}
 * @api public
 */

Pie.prototype.font = function(family){
  this._font = family;
  return this;
};

/**
 * Set text to `str`.
 *
 * @param {String} str
 * @return {Pie}
 * @api public
 */

Pie.prototype.text = function(str){
  this._text = str;
  return this;
};

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
  raf.cancel(this.animation);

  var duration = 2000
    , start = Date.now()
    , end = start + duration
    , text = this._text;

  function step(){
    self.animation = raf(function(){
      var now = Date.now();
      var p = (now - start) / duration;
      var val = ease[self._easing](p);

      if (now - start >= duration) return self.update(segments);
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
  var self = this
    , ratio = window.devicePixelRatio || 1
    , size = this.el.width / ratio
    , half = size / 2
    , x = half
    , y = half
    , rad = half - 1
    , rotate = rotate || 1
    , scale = scale || 1
    , strokeWidth = 2
    , strokeColor = '#fff';

  var total = this.segments.reduce(function(stats, segment){
    if(!segment.value) return stats;
    stats.sum += segment.value;
    stats.count++;
    return stats;
  }, {sum: 0, count: 0});

  var start = 1.5 * Math.PI;

  ctx.clearRect(0, 0, size, size);

  this.segments.forEach(function(segment){
    if(!segment.value) return;

    var angle = rotate * (segment.value/total.sum) * (Math.PI*2);

    ctx.strokeStyle = total.count > 1 ? strokeColor : segment.color;
    ctx.lineWidth = strokeWidth;

    ctx.beginPath();
    ctx.arc(x, y, scale * rad, start, start + angle);
    ctx.lineTo(rad,rad);
    ctx.closePath();
    ctx.fillStyle = segment.color;
    ctx.fill();
    ctx.stroke();

    start += angle;
  });

  if(!this._text) return this;

  // it's a donut
  ctx.beginPath();
  ctx.arc(x, y, rad - (rad / 3), 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.fill();

  ctx.font = this._fontSize + 'px ' + this._font;
  var text = this._text
    , w = ctx.measureText(text).width;
  ctx.fillStyle = this._color;

  ctx.fillText(
      text
    , x - w / 2 + 1
    , y + this._fontSize / 2 - 1);

  return this;
};
