const express = require("express")
const router = express.Router()
const userController = require("./controllers/userController")
const postController = require("./controllers/postController")

// User Related Routs down blow
router.get("/", userController.home)
router.post("/register", userController.register)
router.post("/login", userController.login)
router.post("/logout", userController.logout)
router.post(
  "/create-post",
  userController.mustBeLoggedIn,
  postController.create
)

// Post Related Routs down blow
router.get(
  "/create-post",
  userController.mustBeLoggedIn,
  postController.viewCreateScreen
)
module.exports = router
