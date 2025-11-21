const express = require("express");
const cors = require("cors");
const pdfRoutes = require("./routes/pdfRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// check server status
app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/pdf", pdfRoutes);

module.exports = app;
