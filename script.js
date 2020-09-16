// Inspiration: http://jsfiddle.net/MK73j/4/
// Making canvas look good: https://www.html5rocks.com/en/tutorials/canvas/hidpi/
// Animation util lib: https://popmotion.io/popcorn/

import popcorn from "https://jspm.dev/@popmotion/popcorn";
console.clear();

// canvas set up
const canvas = document.querySelector("canvas");
const dpr = window.devicePixelRatio || 1;
const size = canvas.getBoundingClientRect();
canvas.height = size.height * dpr;
canvas.width = size.width * dpr;

const ctx = canvas.getContext("2d");
ctx.scale(dpr, dpr);

window.addEventListener("resize", function (e) {
  const canvas = document.querySelector("canvas");
  const size = canvas.getBoundingClientRect();
  canvas.height = size.height * dpr;
  canvas.width = size.width * dpr;
  ctx.scale(dpr, dpr);
});

ctx.fillStyle = "black";

// utils
const getRandomColorSet = () => {
  const colorRanges = [
  ["#FE7E9C", "#ff80df"],
  ["#93f", "#ff80df"],
  ["#d8dadb", "#53ceef"],
  ["#FE7E9C", "#F7BD8D"]];

  return colorRanges[Math.floor(Math.random() * colorRanges.length)];
};

// paint splat manager
const Splat = function (options) {
  const self = this;

  let { x, y, event, colorSet } = options;

  // set co-ordinate of event or set shape
  if (typeof x === "undefined" || typeof y === "undefined") {
    if (typeof event === "undefined") throw new Error("Must provide an origin");
    x = event.clientX;
    y = event.clientY;
  }

  // set color gradient
  if (!colorSet) {
    colorSet = ["#FF69B4", "#FFD700"];
  }
  self.colorMix = popcorn.mixColor(...colorSet);

  self.particles = Array(72).
  fill({}).
  map((_, i) => {
    const p = {
      x,
      y,
      angle: i * 5,
      size: 20 + Math.random() * 12.5,
      life: 800 + Math.random() * 640 };

    p.interpolator = popcorn.interpolate([p.size, 0], [0, 1]);
    return p;
  });

  self.start = null;
  let delta = 0;
  let last = Date.now();

  self.decay = t => {
    delta = Date.now() - last;
    last = Date.now();

    self.particles = self.particles.reduce((result, p, i) => {
      p.x += Math.cos(p.angle) * 4 + Math.random() * 2 - Math.random() * 2;
      p.y += Math.sin(p.angle) * 4 + Math.random() * 2 - Math.random() * 2;

      p.life -= delta;
      p.size -= delta / 50;

      if (p.size <= 0) p.life = 0;
      if (p.life <= 0) return result;
      result.push(p);
      return result;
    }, []);
  };

  self.render = () => {
    self.particles.forEach((p, i) => {
      if (Math.random() < 0.1) return;

      ctx.fillStyle = `${self.colorMix(p.interpolator(p.size))}`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
      ctx.fill();
    });
  };

  self.animate = t => {
    self.decay();
    self.render();
    if (self.particles.length > 0) {
      window.requestAnimationFrame(self.animate);
    }
  };

  self.fire = () => {
    window.requestAnimationFrame(self.animate);
  };

  return {
    fire: function () {
      self.fire();
    } };

};

canvas.addEventListener("mousedown", function (e) {
  const s = new Splat({ event: e, colorSet: getRandomColorSet() });
  s.fire();
});

// timed demo
const drawDemo = val => {
  if (val < 1) return;
  const x = Math.random() * size.width;
  const y = Math.random() * size.height;
  const s = new Splat({ x, y, colorSet: getRandomColorSet() });
  s.fire();
  setTimeout(() => {
    drawDemo(val - 1);
  }, 800);
};

drawDemo(4);