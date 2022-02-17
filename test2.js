var uint8 = new Uint8Array([0, 255, 4, 5, 6, 7])

let a = (uint8[1] << 1) + 1
let b = uint8[0] << 1
// let c = uint8[1] >> 3
// let d = uint8[1] >> 4
// let e = uint8[1] >> 5
// let f = uint8[1] >> 6
let g = uint8[1] >> 7
let h = (g << 8) - 1
console.log(a, b, h)
