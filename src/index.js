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
  SQUARE_CANVAS = null
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

function drawLine(context, x1, y1, arr) {
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

  for (let i = 0; i < CANVAS_WIDTH; i += RESOLUTION) {
    gridArr[i] = RESOLUTION + i
  }

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
      drawLine(ctx, USER_X, USER_Y, gridArr)
      USER_X = 0
      USER_Y = 0
      isDrawing = false
      imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      console.log(imageData.data)
      FULL_LENGTH = imageData.data.length
      SQUARE_CANVAS =
        (CANVAS_WIDTH + CANVAS_HEIGHT) * 2 +
        (CANVAS_WIDTH + CANVAS_HEIGHT - 4) * 2 -
        8
      nextGeneration(imageData, ctx)
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
  // document.getElementById("canvas").style.width = "400px"
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

function nextGeneration(grid, ctx) {
  let nextGenArr = new ImageData(
    new Uint8ClampedArray(grid.data),
    grid.width,
    grid.height
  )
  let counter = 0
  let tempWidth = CANVAS_WIDTH * 4

  let fullLength = grid.data.length

  nextGenArr.data[0] = nextCellStatus([
    grid.data[fullLength - 3],
    grid.data[fullLength - tempWidth],
    grid.data[fullLength - tempWidth + 4],
    grid.data[tempWidth - 3],
    grid.data[0],
    grid.data[3],
    grid.data[tempWidth * 2 + 3],
    grid.data[tempWidth * RESOLUTION + 1],
    grid.data[tempWidth * RESOLUTION + 4],
  ])

  ctx.putImageData(nextGenArr, 0, 0)
}
const IS_ALIVE = 0
const IS_DEAD = 255

function nextCellStatus(props) {
  if (props[4] === 255) {
    let sumCell =
      props[0] +
      props[1] +
      props[2] +
      props[3] +
      props[5] +
      props[6] +
      props[7] +
      props[8]
    if (sumCell === 1275) {
      console.log(
        props[0],
        props[1],
        props[2],
        props[3],
        props[5],
        props[6],
        props[7],
        props[8],
        "alive"
      )
      return (cellStatus = IS_ALIVE)
    } else {
      console.log(
        props[0],
        props[1],
        props[2],
        props[3],
        props[5],
        props[6],
        props[7],
        props[8],
        "dead"
      )
      return (cellStatus = IS_DEAD)
    }
  } else {
    let sumCell =
      props[0] +
      props[1] +
      props[2] +
      props[3] +
      props[5] +
      props[6] +
      props[7] +
      props[8]
    console.log(
      props[0],
      props[1],
      props[2],
      props[3],
      props[5],
      props[6],
      props[7],
      props[8],
      "???"
    )
    if (sumCell < 1530) return (cellStatus = IS_DEAD)
    if (sumCell > 1275) return (cellStatus = IS_DEAD)
    else {
      return (cellStatus = IS_ALIVE)
    }
  }
}
