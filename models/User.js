const usersCollection = require("../db").db().collection("users")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const md5 = require("md5")

let User = function (data) {
  this.data = data
  this.errors = []
}

User.prototype.cleanUp = function () {
  if (typeof this.data.username != "string") this.data.username = ""
  if (typeof this.data.email != "string") this.data.email = ""
  if (typeof this.data.password != "string") this.data.password = ""

  // get rid of any bogus property
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
  }
}

User.prototype.validate = function () {
  return new Promise(async (resolve, reject) => {
    if (this.data.username == "") {
      this.errors.push("you must provide a  username.")
    }
    if (
      this.data.username != "" &&
      !validator.isAlphanumeric(this.data.username, "en-US")
    ) {
      this.errors.push("Username can only contain letters and numbers.")
    }
    if (!validator.isEmail(this.data.email)) {
      this.errors.push("you must provide a valid email.")
    }
    if (this.data.password == "") {
      this.errors.push("you must provide a password.")
    }
    if (this.data.password.length > 0 && this.data.password.length < 8) {
      this.errors.push("Password must be at least 8 characters.")
    }
    if (this.data.password.length > 50) {
      this.errors.push("Password cannot exceed 50 characters.")
    }
    if (this.data.username.length > 0 && this.data.username.length < 3) {
      this.errors.push("Username must be at least 3 characters.")
    }
    if (this.data.username.length > 30) {
      this.errors.push("Username cannot exceed 30 characters.")
    }
    //only if username is valid then check if
    if (
      this.data.username.length > 3 &&
      this.data.username.length < 31 &&
      validator.isAlphanumeric(this.data.username, "en-US")
    ) {
      let usernameExists = await usersCollection.findOne({
        username: this.data.username,
      })
      if (usernameExists) {
        this.errors.push("That username is already taken.")
      }
    }

    //only if email is valid then check if
    if (validator.isEmail(this.data.email)) {
      let emailExists = await usersCollection.findOne({
        email: this.data.email,
      })
      if (emailExists) {
        this.errors.push("That email is already taken.")
      }
    }
    resolve()
  })
}

User.prototype.login = function () {
  return new Promise((resolve, reject) => {
    // clean data from incorrect data type
    this.cleanUp()
    usersCollection
      .findOne({ username: this.data.username })
      .then((attemptedUser) => {
        if (
          attemptedUser &&
          bcrypt.compareSync(this.data.password, attemptedUser.password)
        ) {
          this.data = attemptedUser
          this.getAvatar()
          resolve("you logged in . . .")
        } else {
          reject("invalid Username / Password !")
        }
      })
      .catch(function () {
        reject("Please try agian later")
      })
  })
  // this.cleanUp()
  // console.log(this.data)
  // usersCollection.findOne({username: this.data.username},
  //   (err, attemptedUser) => {
  //     if (attemptedUser && attemptedUser.password == this.data.password) {
  //       callback("you logged in . . .")
  //     } else {
  //       callback("invalid Username / Password !")
  //     }
  //   })
}

User.prototype.register = function () {
  return new Promise(async (resolve, reject) => {
    // step 1: Validate user data
    await this.validate()
    this.cleanUp()
    // step 2: Only if there are no validation Errors
    // then save the user in an data base
    if (!this.errors.length) {
      //hash user pass
      let salt = bcrypt.genSaltSync(10)
      this.data.password = bcrypt.hashSync(this.data.password, salt)
      await usersCollection.insertOne(this.data)
      this.getAvatar()
      resolve()
    } else {
      reject(this.errors)
    }
  })
}

User.prototype.getAvatar = function () {
  this.avatar = `https://www.gravatar.com/avatar/${md5(this.data.email)}?d=mp`
}

module.exports = User
