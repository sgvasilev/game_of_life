let CANVAS_WIDTH = null,
  CANVAS_HEIGHT = null,
  NEIGHBOR_OFFSETS_X,
  NEIGHBOR_OFFSETS_Y,
  RESOLUTION = 4,
  coord = { x: 0, y: 0 },
  ctx,
  BOARDS = [],
  imageData,
  DELAY = 32,
  data32,
  startPainting,
  stopPainting,
  sketch
var pos = { x: 0, y: 0 }
const LIVE = "LIVE",
  STOP = "STOP"
const PHASE = [LIVE, STOP],
  SIZE = 200
let NEIGHBOR_OFFSETS = [],
  COLOR = [0, 0xff000000]

function calcCanvas() {
  document
    .getElementById("startButton")
    .addEventListener("click", function (event) {
      event.preventDefault()
      CANVAS_WIDTH = +event.target.form[0].value
      CANVAS_HEIGHT = +event.target.form[1].value
      NEIGHBOR_OFFSETS_X = [-1, 0, 1, -1, 1, -1, 0, 1]
      NEIGHBOR_OFFSETS_Y = [-1, -1, -1, 0, 0, 1, 1, 1]
      NEIGHBOR_OFFSETS = [
        -CANVAS_WIDTH - 1,
        -CANVAS_WIDTH,
        -CANVAS_WIDTH + 1,
        -1,
        +1,
        +CANVAS_WIDTH - 1,
        +CANVAS_WIDTH,
        +CANVAS_WIDTH + 1,
      ]
      const isCanvasMounted = document.querySelector("#canvas__mount")
      if (!isCanvasMounted.hasChildNodes()) {
        if (CANVAS_WIDTH === 0 || CANVAS_HEIGHT === 0) return
        mountCanvas()
      } else {
        isCanvasMounted.removeChild(isCanvasMounted.firstChild)
        mountCanvas()
      }
    })
  document
    .getElementById("stopButton")
    .addEventListener("click", function (event) {
      event.preventDefault()
      const isCanvasMounted = document.querySelector("#canvas__mount")
      console.log(isCanvasMounted, "isCanvasMounted")
      if (isCanvasMounted.hasChildNodes()) {
        isCanvasMounted.removeChild(isCanvasMounted.firstChild)
      } else {
        if (CANVAS_WIDTH === 0 || CANVAS_HEIGHT === 0) return
      }
    })
  document.getElementById("startLoop").addEventListener("click", startLoop)
}

function mountCanvas() {
  const canvas = document.createElement("canvas")
  CANVAS_WIDTH = CANVAS_WIDTH + (CANVAS_WIDTH % RESOLUTION)
  CANVAS_HEIGHT = CANVAS_HEIGHT + (CANVAS_HEIGHT % RESOLUTION)

  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT

  canvas.id = "ctx"
  canvas.style.width = `${CANVAS_WIDTH * RESOLUTION}px`
  canvas.style.height = `${CANVAS_HEIGHT * RESOLUTION}px`

  BOARDS = [
    new Array(CANVAS_WIDTH * CANVAS_HEIGHT).fill(0),
    new Array(CANVAS_WIDTH * CANVAS_HEIGHT).fill(0),
  ]
  canvas.classList.add("border")
  document.querySelector("#canvas__mount").appendChild(canvas)
  //some optimizations
  ctx = canvas.getContext("2d")
  ctx.imageSmoothingEnabled = false
  drawStartPosition(canvas)
}

function drawStartPosition(canvas) {
  console.log("render")
  ctx.data = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  data32 = new Uint32Array(imageData.data.buffer)
  document.addEventListener("mousedown", startPainting)
  document.addEventListener("mouseup", stopPainting)
  document.addEventListener("mousemove", sketch)
  let paint = false
  function getPosition(event) {
    coord.x = event.clientX - canvas.offsetLeft
    coord.y = event.clientY - canvas.offsetTop
  }
  function startPainting(event) {
    paint = true
    getPosition(event)
  }
  function stopPainting() {
    paint = false
  }
  function sketch(event) {
    if (!paint) return
    ctx.fillStyle = "black"
    let X = Math.floor(coord.x / RESOLUTION)
    let Y = Math.floor(coord.y / RESOLUTION)
    getPosition(event)
    ctx.fillRect(X, Y, 1, 1)
  }
}

function startLoop(event) {
  event.preventDefault()

  document.removeEventListener("mousedown", startPainting)
  document.removeEventListener("mouseup", stopPainting)
  document.removeEventListener("mousemove", sketch)
  const tempData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  let j = 0
  let data = data32
  for (let i = 0; i < tempData.data.length; i += 4) {
    BOARDS[0][j] = tempData.data[i] === 255 ? 0 : 1
    data[i] = COLOR[BOARDS[0][j]]
    j++
  }
  console.log(BOARDS[0])
  window.requestAnimationFrame(() => drawImage(BOARDS[0]))
  renew()
}
function renew() {
  let LIVING_CELLS = 0
  const boardPrev = BOARDS[0]
  const boardNext = BOARDS[1]
  let index = 0
  let neighbors = 0
  let count = 0
  for (let i = 0; i < CANVAS_HEIGHT; i++) {
    for (let j = 0; j < CANVAS_WIDTH; j++) {
      if (
        i === 0 ||
        i === CANVAS_HEIGHT - 1 ||
        j === 0 ||
        j === CANVAS_WIDTH - 1
      ) {
        neighbors = 0
        count = 0
        while (neighbors < NEIGHBOR_OFFSETS_X.length) {
          let resultX =
            (j + NEIGHBOR_OFFSETS_X[neighbors] + CANVAS_WIDTH) % CANVAS_WIDTH

          const resultY =
            (i + NEIGHBOR_OFFSETS_Y[neighbors] + CANVAS_HEIGHT) % CANVAS_HEIGHT

          count += boardPrev[resultY * CANVAS_HEIGHT + resultX]
          neighbors++
        }
      } else {
        neighbors = 0
        count = 0
        while (neighbors < NEIGHBOR_OFFSETS_Y.length) {
          count +=
            boardPrev[i * CANVAS_HEIGHT + j + NEIGHBOR_OFFSETS[neighbors]]
          neighbors++
        }
      }
      if (boardPrev[index] === 1) {
        if (count === 2 || count === 3) {
          boardNext[index] = 1
          LIVING_CELLS++
        } else {
          boardNext[index] = 0
        }
      } else if (boardPrev[index] === 0) {
        if (count === 3) {
          boardNext[index] = 1
          LIVING_CELLS++
        } else {
          boardNext[index] = 0
        }
      } else {
        boardNext[index] = boardPrev[index]
      }
      // console.log(
      //   boardPrev[index],
      //   `WAS ${boardPrev[index] === 1 ? "ALIVE" : "dead"} become ${
      //     boardNext[index] === 1 ? "ALIVE" : "DEAD"
      //   } `
      // )
      index++
      count = 0
    }
  }

  drawImage(boardNext)
  for (let i = 0; i < boardNext.length; i++) {
    BOARDS[0][i] = boardNext[i]
  }
  setTimeout(() => {
    renew()
  }, DELAY)
}

function drawImage(board) {
  for (let i = 0; i < data32.length; i++) {
    data32[i] = COLOR[board[i]]
  }
  ctx.putImageData(imageData, 0, 0)
}

// function rerender() {
//   const LIVING_CELLS = renew()
//   if (LIVING_CELLS) {
//     setTimeout(() => {
//       renew()
//     }, DELAY)
//   }
// }

document.addEventListener(
  "DOMContentLoaded",
  function () {
    calcCanvas()
  },
  false
)
