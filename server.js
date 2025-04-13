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
    const regex_retailer = /^[\w\s\-&]+$/;
    const regex_description = /^[\w\s\-]+$/;
    /* Testing stuff */
    let totalCorrect = "15.55";
    let totalIncorrect = "1.2";
    const string1 = "Hello World-123";
    const string2 = "Hello, World!";
    const string3 = "Hello World-123@";
    const result11 = regex_retailer.test(string1);
    const result12 = regex_retailer.test(string2);
    const result21 = regex_description.test(string1);
    const result22 = regex_description.test(string2);
    const result31 = regex_retailer.test(string3);
    const result32 = regex_description.test(string3);
    console.log(`"${string1}" matches the regex: ${result11}`);
    console.log(`"${string2}" matches the regex: ${result12}`);
    console.log(`"${string1}" matches the regex: ${result21}`);
    console.log(`"${string2}" matches the regex: ${result22}`);
    console.log(`"${string3}" matches the regex: ${result31}`);
    console.log(`"${string3}" matches the regex: ${result32}`);
    // console.log(`"${string2}" matches the regex:`);
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
