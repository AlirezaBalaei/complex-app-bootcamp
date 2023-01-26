const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const flash = require("connect-flash")
const app = express()

let sessionOptions = session({
  secret: "i realy like javascript for backend usage lol .......",
  store: MongoStore.create({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true },
})

const router = require("./router.js")

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(sessionOptions)
app.use(flash())

app.use(function (req, res, next) {
  res.locals.user = req.session.user
  next()
})
app.use(express.static("./public"))

app.use("/", router)

app.set("views", "views")
app.set("view engine", "ejs")

module.exports = app
