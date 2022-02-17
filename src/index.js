let CANVAS_WIDTH = null,
  CANVAS_HEIGHT = null,
  RESOLUTION = 6,
  BIAS = 3,
  CANVAS_WIDTH_CALC = null,
  CANVAS_HEIGHT_CALC = null,
  SPEED = null,
  lineWidth = null,
  listenerInputOne = null,
  listenerInputTwo = null,
  gridArr = [],
  SQUARE_CANVAS = null,
  BOARDS = []

const PHASE = ["LIVE", "STOP"]

let FULL_LENGTH = 0
listeningOnInputs()
function startCanvas() {
  document
    .getElementById("startButton")
    .addEventListener("click", function (event) {
      event.preventDefault()
      CANVAS_WIDTH = +event.target.form[0].value
      CANVAS_HEIGHT = +event.target.form[1].value
      const isCanvasMounted = document.querySelector("#canvas")
      if (!isCanvasMounted.hasChildNodes()) {
        if (CANVAS_WIDTH === 0 || CANVAS_HEIGHT === 0) return
        calcResolution()
        mountCanvas()
      } else {
        isCanvasMounted.removeChild(isCanvasMounted.firstChild)
        calcResolution()
        mountCanvas()
      }
    })
  document
    .getElementById("stopButton")
    .addEventListener("click", function (event) {
      event.preventDefault()
      document.getElementById("input_1").disabled = false
      const isCanvasMounted = document.querySelector("#canvas")
      if (isCanvasMounted.hasChildNodes()) {
        isCanvasMounted.removeChild(isCanvasMounted.firstChild)
      } else {
        if (CANVAS_WIDTH === 0 || CANVAS_HEIGHT === 0) return
        calcResolution()
        mountCanvas()
      }
    })
}

function drawLine(context, x1, y1) {
  context.beginPath()
  context.fillStyle = "rgb(0,0,0)"
  let closeX = null,
    closeY = null

  closeX = x1 % RESOLUTION
  closeY = y1 % RESOLUTION

  if (closeX === BIAS) {
    x1 = x1 - BIAS
  } else {
    x1 = x1 - closeX
  }
  if (closeY === BIAS) {
    y1 = y1 - BIAS
  } else {
    y1 = y1 - closeY
  }

  context.fillRect(x1, y1, RESOLUTION, RESOLUTION)
  context.stroke()
  context.closePath()
}
const prepareRender = () => {
  let isDrawing = false
  let USER_X = 0
  let USER_Y = 0
  let imageData

  const canvas = document.getElementById("ctx")
  const ctx = canvas.getContext("2d", { alpha: false })

  ctx.fillStyle = "rgb(255,255,255)"
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  canvas.addEventListener("mousedown", (e) => {
    USER_X = e.offsetX
    USER_Y = e.offsetY
    isDrawing = true
  })

  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing === true) {
      drawLine(ctx, USER_X, USER_Y, e.offsetX, e.offsetY)
      USER_X = e.offsetX
      USER_Y = e.offsetY
    }
  })
  window.addEventListener("mouseup", () => {
    if (isDrawing === true) {
      drawLine(ctx, USER_X, USER_Y)
      USER_X = 0
      USER_Y = 0
      isDrawing = false
      imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      FULL_LENGTH = imageData.data.length
      SQUARE_CANVAS =
        (CANVAS_WIDTH + CANVAS_HEIGHT) * 2 +
        (CANVAS_WIDTH + CANVAS_HEIGHT - 4) * 2 -
        8
      update(imageData, ctx)
    }
  })
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    startCanvas()
  },
  false
)

function mountCanvas() {
  const cellPicture = Object.assign(document.createElement("canvas"), {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  })
  cellPicture.setAttribute("id", "ctx")
  document.getElementById("canvas").appendChild(cellPicture)
  prepareRender()
}

function listeningOnInputs() {
  listenerInputOne = document.getElementById("input_1")
  listenerInputOne.addEventListener("change", listenOnSizeChange, false)
}
function listenOnSizeChange(event) {
  RESOLUTION = event.target.value
  BIAS = RESOLUTION / 2
}

function calcResolution() {
  if (RESOLUTION == 0) {
    RESOLUTION = 1
  }
  CANVAS_WIDTH_CALC = CANVAS_WIDTH % RESOLUTION
  CANVAS_HEIGHT_CALC = CANVAS_HEIGHT % RESOLUTION
  CANVAS_WIDTH = CANVAS_WIDTH + (RESOLUTION - CANVAS_WIDTH_CALC)
  CANVAS_HEIGHT = CANVAS_HEIGHT + (RESOLUTION - CANVAS_HEIGHT_CALC)

  document.getElementById("input_1").disabled = true
}

function update(grid, ctx) {
  let nextGenArr = new ImageData(grid.data, grid.width, grid.height)
  FULL_LENGTH = nextGenArr.data.length
  console.log(FULL_LENGTH, "FULL_LENGTH")
  let counter = 0
  let tempWidth = CANVAS_WIDTH * 4
  console.log(tempWidth, "tempWidth")
  let tempHeight = CANVAS_HEIGHT * 4
  let neighbor = 0
  let allNeighbor = 0
  for (let i = 0; i < FULL_LENGTH; i += 4) {
    neighbor =
      grid.data[i - tempWidth - 1] +
      grid.data[i - tempWidth] +
      grid.data[i - tempWidth + 1] +
      grid.data[i - 1] +
      grid.data[i + 1] +
      grid.data[i + tempWidth - 1] +
      grid.data[i + tempWidth] +
      grid.data[i + tempWidth + 1]

    if (grid.data[i] === 0) {
      if (neighbor === 1530 || neighbor === 1275) {
        nextGenArr.data[i] = 0
        nextGenArr.data[i + 1] = 0
        nextGenArr.data[i + 2] = 0
      } else {
        nextGenArr.data[i] = 255
        nextGenArr.data[i + 1] = 255
        nextGenArr.data[i + 2] = 255
      }
    } else {
      if (neighbor === 1275) {
        nextGenArr.data[i] = 0
        nextGenArr.data[i + 1] = 0
        nextGenArr.data[i + 2] = 0
      } else {
        nextGenArr.data[i] = 255
        nextGenArr.data[i + 1] = 255
        nextGenArr.data[i + 2] = 255
      }
    }
    neighbor = 0
  }
  // console.log(nextGenArr)
  ctx.putImageData(nextGenArr, 0, 0)
}
const IS_ALIVE = 0
const IS_DEAD = 255

function fillZeroes(ctx, nextGenArr, data) {
  ctx.fill
}
