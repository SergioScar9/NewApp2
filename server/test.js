// Crea test.js con solo questo:
const express = require("express");
const app = express();

app.get("/debug/rooms", (req, res) => {
  res.json({ test: "funziona" });
});

app.listen(3003, () => {
  console.log("Test server attivo");
});
