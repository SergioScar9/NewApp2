const express = require("express");
const pasth = require("path");
const bcrypt = require("bcrypt");

const app = express();

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/singup", (req, res) => {
  res.render("singup");
});



const port = 5000;
app.listen(port, () => {
  console.log(`Server attivo sulla Port: ${port}`);
});
