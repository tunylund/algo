import game from './game.mjs'

const init = () => {
  const canvas = document.createElement('canvas')
  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  window.addEventListener('resize', resize)
  resize()
  document.body.style.margin = '0'
  document.body.appendChild(canvas)
  return canvas.getContext('2d')
}

const either = (a, b, balance = 0.5) => Math.random() > balance ? a : b
const rand = (min, max) => Math.random() * (max ? max : min) + (max ? min : 0)
const times = (count, fn) => new Array(parseInt(count)).fill(null).map((value, i) => fn(i))
const limit = (value, min, max) => value < min ? min : value > max ? max : value

class Color {
  constructor(r, g, b, a) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a
    this.shiftPolarity = 1
    this.shiftee = ['g', 'b'].reduce(either, 'r')
    this.orig = {r, g, b, a}
  }
  toString() {
    return `rgba(${this.r.toFixed(0)}, ${this.g.toFixed(0)}, ${this.b.toFixed(0)}, ${this.a.toFixed(0)})`
  }
  shift(amount, max = 45) {
    const _min = Math.max(this.orig[this.shiftee] - max, 0)
    const _max = Math.min(this.orig[this.shiftee] + max, 255)
    if (this[this.shiftee] > _max || this[this.shiftee] < _min) this.shiftPolarity = -this.shiftPolarity
    this[this.shiftee] += this.shiftPolarity * amount
  }
}

let w = 0, h = 0, top = 0
const stripRatio = 1/6
const globals = () => {
  w = window.innerWidth
  h = window.innerHeight * stripRatio
  top = window.innerHeight / 2 - window.innerHeight * stripRatio / 2
}

const ctx = init()
const background = () => {
  const baseColor = new Color(rand(255), rand(255), rand(255), 1)
  const endColor = new Color(rand(255), rand(255), rand(255), 1)
  const highlight = new Color(rand(255), rand(255), rand(255), 1)
  const orig = new Color(highlight.r, highlight.g, highlight.b, 1)
  let rcolorDiff = 2
  return (diff, gameTime) => {
    baseColor.shift(1)
    highlight.shift(2)
    endColor.shift(1)
    const gradient = ctx.createRadialGradient(w/2, top + h/2, 0, w, h, 1000)
    gradient.addColorStop(0, baseColor.toString())
    gradient.addColorStop(0.5, highlight.toString())
    gradient.addColorStop(1, endColor.toString())
    ctx.save()
    ctx.fillStyle = gradient
    ctx.fillRect(0, top, w, h)
    ctx.restore()
  }
}

const buildings = () => {
  const dings = times(rand(30, 40), (i) => ({
    x: rand(w),
    w: rand(10, w / 20),
    h: (h - h/4) / rand(1, 3)
  }))
  const windows = dings.map(b => times(b.w / 4, i => ({
    x: b.x + i*4,
    w: 4,
    h 
  })))
  const ww = 2, wh = 2, wg = 3, buildingColor = new Color(0, 0, 0, 1)
  const drawBuilding = (b) => {
    ctx.fillStyle = buildingColor.toString()
    ctx.fillRect(b.x, top + (h - b.h), b.w, b.h)
  }
  // const drawWindows = (b) => {
  //   ctx.fillStyle = 'white'
  //   times((b.w - wg) / (ww+wg), (iw) => times((b.h - wg) / (wh+wg), (ih) => {
  //     ctx.fillRect(
  //       b.x + wg + iw * ww + iw * wg,
  //       top + (h - b.h) + wg + ih * wg + ih * wh,
  //       ww, wh)
  //   }))
  // }
  return (diff, gameTime) => {
    ctx.save()
    buildingColor.shift(2, 75)
    dings.map(b => {
      drawBuilding(b)
      //drawWindows(b)
    })
    ctx.restore()
  }
}

const birds = () => {
  const birds = times(40, i => ({ x: w/2 + either(i * 10, -i * 10), y: 0, flapDir: either(1, -1), lastFlap: 0, s: 2 }))
  const draw = (b) => {
    ctx.fillStyle = 'white'
    ctx.fillRect(b.x - b.s, b.y + top + b.s * b.flapDir, b.s, b.s)
    ctx.fillRect(b.x, b.y + top, b.s, b.s)
    ctx.fillRect(b.x + b.s, b.y + top + b.s * b.flapDir, b.s, b.s)
  }
  return (diff, gameTime) => {
    ctx.save()
    birds.map(b => {
      if (gameTime - b.lastFlap > 60) {
        b.flapDir = -b.flapDir
        b.lastFlap = gameTime
      }
      b.x = limit(b.x + either(1, -1), 0, w)
      b.y = limit(b.y + either(1, -1), 0, h)
    })
    birds.map(draw)
    ctx.restore()
  }
}

const player = () => {
  let x = w / 2, y = h/2
  let swordHeight = 100
  let swordColor = new Color(100, 255, 100)
  return (diff, gameTime) => {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, y + top)
    ctx.arcTo(x + 100, top + y, x, top + y + swordHeight, (Math.PI/180)*95)
    ctx.fillStyle = swordColor.toString()
    ctx.stroke()
    ctx.restore()
  }
}

globals()
game([globals, background(), buildings(), birds(), player()])