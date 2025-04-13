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
  // console.log(req);
  try {
    const contentType = req.headers["content-type"];

    if (contentType !== "application/json") {
      const error = new Error("content-type is not correct");
      error.status = 400;
      throw error;
    }
    if (!req.body || Object.keys(req.body).length === 0) {
      const error = new Error("Request body is not correct");
      error.status = 400;
      throw error;
    }

    const result = req.body;
    const regex_total = /^\d+\.\d{2}$/;
    const regex_description = /^[\w\s\-&]+$/;
    console.log("THE RES", result);
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
