const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config");
const User = require("../model/userModel");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get("/users", (req, res) => {
  User.find({}, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

router.post("/register", (req, res) => {
  let hashPassword = bcrypt.hashSync(req.body.password, 8);
  User.create(
    {
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      phone: req.body.phone,
      role: req.body.role ? req.body.role : "User",
    },
    (err, results) => {
      if (err) return res.send("Error while registering");
      res.send("User Registered Successfully");
    }
  );
});

router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    // const validPassword = bcrypt.compareSync(req.body.password, user.password);
    // let token = jwt.sign({ id: user._id }, config.secret, { expiresIn: 86400 });
    if (err)
      return res.send({
        auth: false,
        token: "Error While Login in ",
      });
    if (!user)
      res.send({
        auth: false,
        token: "No user found",
      });
    else {
      const validPassword = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!validPassword)
        return res.send({ auth: false, token: "Invalid Password" });
      // in case both match
      let token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400,
      }); //24 hours
      res.send({ auth: true, token: token });
    }
  });
});

router.get("/userinfo", (req, res) => {
  let token = req.headers["x-access-token"];
  if (!token)
    res.send({
      auth: false,
      token: "No token provided",
    });
  //If token is provided
  jwt.verify(token, config.secret, (err, user) => {
    if (err)
      return res.send({
        auth: false,
        token: "Invalid Token",
      });
    User.findById(user.id, (err, results) => {
      res.send(results);
    });
  });
});
///////////Exporting Routes to app.js/////////////////////
module.exports = router;
