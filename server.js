import express from "express";
import dotenv from "dotenv";
import { regex } from "regex";
dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message:
      "You couldn't live with your failure, where did it bring you? Back to me!!!",
  });
});

let uuidReceipt = {};

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
    /*
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
    */
    /* Testing stuff ended */
    /**
     * validating the type of description and price value
     * @param {object} item - the data in the post API data.
     * @return {boolean}
     * @see {@link https://stackoverflow.com/a/73985944/9984976 | Valid Times on a Digital Clock}
     */
    const checkItems = (items) => {
      for (let i = 0; i < items.length; i++) {
        if (
          !regex_description.test(items[i].shortDescription) || //should be of type of string and fit the pattern "^[\\w\\s\\-]+$"
          !regex_total.test(items[i].price) //should be of type of string and fit the pattern "^\\d+\\.\\d{2}$"
        ) {
          return true;
        }
      }
      return false;
    };

    let retailer_name = result.retailer;
    let total_val = result.total;
    /**
     * Validating the post api in data
     */
    if (
      !regex_retailer.test(retailer_name) || //should be of type of string and fit the pattern "^[\\w\\s\\-&]+$"
      !regex_total.test(total_val) || //should be of type of string and fit the pattern "^\\d+\\.\\d{2}$"
      checkItems(result.items)
    ) {
      const error = new Error("Request body is not correct");
      error.status = 400;
      throw error;
    }

    //check if the date is correct
    if (
      typeof result.purchaseDate !== string ||
      !isNaN(new Date(result.purchaseDate))
    ) {
      const error = new Error("The date is not correct.");
      error.status = 400;
      throw error;
    }

    //check if the time is correct
    /**
     * The time will always be in military time and i.e. 24-hour time
     * @param {string} - dateValue
     * @return {boolean}
     */
    function validateTime(dateValue) {
      let [hours, mins] = dateValue.split(":").map(Number);
      return hours <= 23 && hours >= 0 && mins >= 0 && mins < 60;
    }

    if (
      typeof result.purchaseTime !== string ||
      !validateTime(result.purchaseTime)
    ) {
      const error = new Error("The time is not correct.");
      error.status = 400;
      throw error;
    }

    let uuid = crypto.randomUUID();
    while (uuidReceipt.hasOwnProperty(uuid)) {
      //making sure to avoid collisions of uuid
      uuid = crypto.randomUUID();
    }
    console.log("THE UUID: ", uuid);

    uuidReceipt[uuid] = result;

    res.status(200).json({
      id: uuid,
    });

    console.log(uuidReceipt);
  } catch (error) {
    console.log("The error", error.status);
    const status = error.status || 500;
    // the below part is commented out only because I am still debugging and developing.
    // if(status === 500){
    //   error.message = "Internal server error";
    // }
    res.status(status).json({
      message: "The receipt is invalid.\n" + error.message,
    });
  }
});

app.get("/receipts/:id/points", (req, res) => {
  const id = req.params.id;
  console.log("THE ID: ", id);
  try {
    if (!uuidReceipt.hasOwnProperty(id)) {
      const error = new Error("No receipt found for that ID.");
      error.status = 404;
      throw error;
    }

    // TODO: Implement the points calculation logic here
    const receiptData = uuidReceipt[id];
    console.log("The data", receiptData);
    let points = 0;
    /**
     * One point for every alphanumeric character in the retailer name.
     * using the regex `/[0-9a-zA-Z]/g` to count the alphanumeric values in the retailer string.
     * @param {string} retailer_name - data we get from receipt/process api where the name of the retailer is present
     * @returns {number} number of alphanumeric characters in the retailer's name.
     * @see {@link https://stackoverflow.com/questions/7349312/how-to-count-the-number-of-letters-in-a-random-string | How to count the number of letters in a random string?}
     */
    const calcAlphaNumericChar = (retailer_name) => {
      var numsAlphaChar = retailer_name.match(/[0-9a-zA-Z]/g).length;
      return numsAlphaChar;
    };

    const roundDollarAmt = (total) => {
      const totalStr = (total + "").split(".");
      if (typeof totalStr[1] === "undefined") {
        const error = new Error(
          "Total value is not accurate with it's decimal value"
        );
        error.status = 400;
        throw error;
      }
      if (totalStr[1] === "00") {
        return 50;
      } else {
        return 0;
      }
    };

    res.status(200).json({ points: points });
  } catch (error) {
    console.log("The error", error.status);
    const status = error.status || 500;
    // the below part is commented out only because I am still debugging and developing.
    // if(status === 500){
    //   error.message = "Internal server error";
    // }
    res.status(status).json({
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`App running on ${PORT}`);
});
