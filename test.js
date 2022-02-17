"use strict"

const RESET_TIME = 1000 // in millisecond
const TICK_TIME = 32 // in millisecond
const SIZE = 160 // in cells

// Cell rules
const DIE = -1,
  BIRTH = 1,
  NO_CHANGE = 0

// RULES index of items is neighbor count.
// 5 Items as rules for count 4,5,6,7,8 have same outcome
// First rule set for dead cells, second for live cells
const RULES = [
  [NO_CHANGE, NO_CHANGE, NO_CHANGE, BIRTH, NO_CHANGE],
  [DIE, DIE, NO_CHANGE, NO_CHANGE, DIE],
]
// MAX_COUNT max living neighbors to count
const MAX_COUNT = RULES[0].length - 1

// next two arrays are offsets to neighbors as 1D and 2D coords
const NEIGHBOR_OFFSETS = [
  -SIZE - 1,
  -SIZE,
  -SIZE + 1,
  -1,
  1,
  SIZE - 1,
  SIZE,
  SIZE + 1,
]
const EDGE_OFFSETS = [
  // as coord pairs, x, y for cells at edge
  -1, -1, 0, -1, 1, -1, -1, 0, 1, 0, -1, 1, 0, 1, 1, 1,
]

// double buffered board state
var BOARDS = [new Array(SIZE * SIZE).fill(0), new Array(SIZE * SIZE).fill(0)]
var currentState = 0

// canvas for display
const display = Object.assign(document.createElement("canvas"), {
  width: SIZE,
  height: SIZE,
})
display.ctx = display.getContext("2d")
display.pixels = display.ctx.getImageData(0, 0, SIZE, SIZE)
display.buf32 = new Uint32Array(display.pixels.data.buffer)
const PIXELS = [0, 0xff000000] // Uint32 pixel value NOTE channel order ABGR
// eg 0xFF000000 is black 0xFF0000FF is red
document.body.appendChild(display)
display.addEventListener("click", randomize) // click to restart

// start game
randomize()
tick()

function randomize(density = 0.1) {
  const b = BOARDS[currentState % 2]
  var i = b.length
  while (i--) {
    b[i] = Math.random() < density ? 1 : 0
  }
  render()
}
function render() {
  const b = BOARDS[currentState % 2],
    d32 = display.buf32
  var i = b.length
  while (i--) {
    d32[i] = PIXELS[b[i]]
  }
  display.ctx.putImageData(display.pixels, 0, 0)
}
function update() {
  var x,
    y = SIZE,
    idx = SIZE * SIZE - 1,
    count,
    k,
    total = 0

  // Aliases for various constants and references to keep code line sizes short.
  const ps = BOARDS[currentState % 2] // prev state
  const ns = BOARDS[(currentState + 1) % 2] // new state
  const NO = NEIGHBOR_OFFSETS,
    EO = EDGE_OFFSETS,
    S = SIZE,
    S1 = SIZE - 1
  while (y--) {
    x = SIZE
    while (x--) {
      count = 0
      if (x === 0 || x === S1 || y === 0 || y === S1) {
        k = 0
        while (k < EO.length && count < MAX_COUNT) {
          const idxMod = ((x + S + EO[k]) % S) + ((y + S + EO[k + 1]) % S) * S
          count += ps[idxMod]
          k += 2
        }
      } else {
        k = 0
        while (k < NO.length && count < MAX_COUNT) {
          count += ps[idx + NO[k++]]
        }
      }
      const useRule = RULES[ps[idx]][count]
      if (useRule === DIE) {
        ns[idx] = 0
      } else if (useRule === BIRTH) {
        ns[idx] = 1
      } else {
        ns[idx] = ps[idx]
      }
      total += ns[idx]
      idx--
    }
  }
  return total
}

function tick() {
  const living = update()
  currentState++
  render()
  if (living) {
    setTimeout(tick, TICK_TIME)
  } else {
    randomize()
    setTimeout(tick, RESET_TIME)
  }
}
