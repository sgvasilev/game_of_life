let CANVAS_WIDTH = null,
  CANVAS_HEIGHT = null,
  RESOLUTION = 2,
  coord = { x: 0, y: 0 },
  ctx,
  BOARDS = [],
  imageData,
  DELAY = 8,
  data32,
  NEIGHBOR_OFFSETS = [],
  isRendering = false

let pos = { x: 0, y: 0 }

const NEIGHBOR_OFFSETS_X = [-1, 0, 1, -1, 1, -1, 0, 1],
  NEIGHBOR_OFFSETS_Y = [-1, -1, -1, 0, 0, 1, 1, 1],
  COLOR = [0, 0xff000000]

function calcCanvas() {
  const calcResolution = document.getElementById("input_1")
  calcResolution.addEventListener("change", () => {
    if (calcResolution.value == 0) {
      RESOLUTION = 1
    } else {
      RESOLUTION = calcResolution.value
    }
  })
  const randomValues = document.getElementById("random")
  randomValues.addEventListener("click", (event) => {
    randomize(event)
  })
  const setStopLoop = document.getElementById("stopLoop")
  setStopLoop.addEventListener("click", stopDraw)
  const changeDelay = document.getElementById("delay_input")
  changeDelay.addEventListener("change", () => {
    DELAY = changeDelay.value
  })
  document
    .getElementById("startButton")
    .addEventListener("click", function (event) {
      event.preventDefault()
      calcResolution.disabled = true
      CANVAS_WIDTH = +event.target.form[0].value
      CANVAS_HEIGHT = CANVAS_WIDTH

      const isCanvasMounted = document.querySelector("#canvas__mount")
      if (!isCanvasMounted.hasChildNodes()) {
        if (CANVAS_WIDTH === 0 || CANVAS_HEIGHT === 0) return
        mountCanvas()
      } else {
        isCanvasMounted.removeChild(isCanvasMounted.firstChild)
        mountCanvas()
      }
    })
  document.getElementById("stopButton").addEventListener("click", () => {
    clearCanvas()
  })
}

function mountCanvas() {
  const canvas = document.createElement("canvas")
  CANVAS_WIDTH = CANVAS_WIDTH + (CANVAS_WIDTH % RESOLUTION)
  CANVAS_HEIGHT = CANVAS_HEIGHT + (CANVAS_HEIGHT % RESOLUTION)
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
  ctx = canvas.getContext("2d")
  ctx.imageSmoothingEnabled = false
  drawStartPosition(canvas)
}

function drawStartPosition(canvas) {
  ctx.data = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  data32 = new Uint32Array(imageData.data.buffer)

  document.addEventListener("mousedown", startPainting)
  document.addEventListener("mouseup", stopPainting)
  document.addEventListener("mousemove", draw)

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
  function draw(event) {
    if (!paint) return
    ctx.fillStyle = "black"
    let X = Math.floor(coord.x / RESOLUTION)
    let Y = Math.floor(coord.y / RESOLUTION)
    getPosition(event)
    ctx.fillRect(X, Y, 1, 1)
  }
  const startButton = document.getElementById("startLoop")
  startButton.addEventListener("click", () => {
    startLoop(event, startPainting, stopPainting, draw)
  })
}

function startLoop(event, startPainting, stopPainting, sketch) {
  isRendering = true
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
  window.requestAnimationFrame(() => drawImage(BOARDS[0]))
  renew()
}
function renew() {
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
        } else {
          boardNext[index] = 0
        }
      } else if (boardPrev[index] === 0) {
        if (count === 3) {
          boardNext[index] = 1
        } else {
          boardNext[index] = 0
        }
      } else {
        boardNext[index] = boardPrev[index]
      }
      index++
    }
  }
  drawImage(boardNext)
  for (let i = 0; i < boardNext.length; i++) {
    BOARDS[0][i] = boardNext[i]
  }
  reRender()
}
function reRender() {
  if (isRendering === true) {
    setTimeout(() => {
      requestAnimationFrame(renew)
    }, DELAY)
  } else {
    return 0
  }
}

function drawImage(board) {
  for (let i = 0; i < data32.length; i++) {
    data32[i] = COLOR[board[i]]
  }
  ctx.putImageData(imageData, 0, 0)
}
function calcResolution(data) {
  RESOLUTION = data
}
function stopDraw() {
  isRendering = false
  clearCanvas()
}
function clearCanvas() {
  const isCanvasMounted = document.querySelector("#canvas__mount")
  if (isCanvasMounted.hasChildNodes()) {
    isCanvasMounted.removeChild(isCanvasMounted.firstChild)
  } else {
    if (CANVAS_WIDTH === 0 || CANVAS_HEIGHT === 0) return
  }
}
function randomize(event) {
  event.preventDefault()
  isRendering = false

  let data = data32
  const density = 0.15
  for (let i = 0; i < BOARDS[0].length; i++) {
    BOARDS[0][i] = Math.random() < density ? 1 : 0
  }

  window.requestAnimationFrame(() => drawImage(BOARDS[0]))
  setTimeout(() => {
    isRendering = true
    renew()
  }, DELAY * 2)
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    calcCanvas()
  },
  false
)
