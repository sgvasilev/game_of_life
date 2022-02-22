canvas.addEventListener("click", () => {
  var time = performance.now()
  ctx.putImageData(processPixels(randomPixels, invertPixels), 0, 0)
  time = (performance.now() - time) * 1000
  var rate = pixelCount / time
  var pps = ((1000000 * rate) | 0).toLocaleString()
  info.textContent =
    "Time to process " +
    pixelCount.toLocaleString() +
    " pixels : " +
    (time | 0).toLocaleString() +
    "µs, " +
    (rate | 0) +
    "pix per µs " +
    pps +
    " pixel per second"
})

const ctx = canvas.getContext("2d")
const pixelCount = innerWidth * innerHeight
canvas.width = innerWidth
canvas.height = innerHeight
const randomPixels = putPixels(
  ctx,
  createImageData(canvas.width, canvas.height, randomRGB)
)

function createImageData(width, height, filter) {
  return processPixels(ctx.createImageData(width, height), filter)
}
function processPixels(pixelData, filter = doNothing) {
  return filter(pixelData)
}
function putPixels(context, pixelData, x = 0, y = 0) {
  context.putImageData(pixelData, x, y)
  return pixelData
}

// Filters must return pixeldata

function doNothing(pd) {
  return pd
}
function randomRGB(pixelData) {
  var i = 0
  var dat32 = new Uint32Array(pixelData.data.buffer)
  while (i < dat32.length) {
    dat32[i++] = 0xff000000 + Math.random() * 0xffffff
  }
  return pixelData
}

function invertPixels(pixelData) {
  var i = 0
  var dat = pixelData.data
  while (i < dat.length) {
    dat[i] = 255 - dat[i++]
    dat[i] = 255 - dat[i++]
    dat[i] = 255 - dat[i++]
    i++ // skip alpha
  }
  return pixelData
}
