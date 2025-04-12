import express from "express";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

app.get("/", (req, res) => {
  res.json({ message: "We have mounted the voulme to running container" });
});

app.post("/receipts/process", (req, res) => {
  res.json({ message: "We have mounted the voulme to running container" });
});

app.get("/receipts/{id}/points", (req, res) => {
  res.json({ message: "We have mounted the voulme to running container" });
});

app.listen(PORT, () => {
  console.log(`App running on ${PORT}`);
});
