var path = require("path")
var express = require("express")

const app = express()

app.use(express.static(path.join(__dirname, "src")))
app.set("port", process.env.PORT || 8080)

var server = app.listen(app.get("port"), function () {
  console.log("listening on port ", server.address().port)
})
