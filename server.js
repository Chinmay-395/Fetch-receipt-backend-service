import express from "express";
import dotenv from "dotenv";
import { regex } from "regex";
dotenv.config();
const str = "abc";
// → true
var x = regex`^\\d+\\.\\d{2}$`.test(str);
console.log("the ans", x);

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message:
      "You couldn't live with your failure, where did it bring you? Back to me!!!",
  });
});

app.post("/receipts/process", (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      const error = new Error("Request body is empty or missing");
      error.status = 400; // Bad Request
      throw error;
    }
    // Process the request if body exists
    const result = req.body;
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status).json({
      message: error.message,
    });
  }
});

app.get("/receipts/{id}/points", (req, res) => {
  res.json({ message: "We have mounted the voulme to running container" });
});

app.listen(PORT, () => {
  console.log(`App running on ${PORT}`);
});
