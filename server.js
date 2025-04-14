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
      typeof result.purchaseDate !== "string" ||
      isNaN(new Date(result.purchaseDate)) //validating the date is correct or not.
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
      typeof result.purchaseTime !== "string" ||
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
    if (status === 500) {
      error.message = "Internal server error";
    } else {
      error.message = "The receipt is invalid." + " " + error.message;
    }
    res.status(status).json({
      message: error.message,
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

    /**
     * 50 points if the total is a round dollar amount with no cents.
     * @param {string} total - the value we get from receipt/process api
     * @returns {number} - points earned
     */
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
    /**
     * 25 points if the total is a multiple of `0.25`.
     * @param {string} total - the value we get from receipt/process api
     * @return {number} - points earned
     */
    const multipleOf0_25 = (total) => {
      let val = parseFloat(total);
      if (val % 0.25 === 0) {
        return 25;
      } else return 0;
    };
    /**
     * 5 points for every two items on the receipt.
     * for eg: 5 items purchased
     * 5 divided by 2 is 2
     * thus the total points earned here are 10
     * @param {object} item - it has two major things "shortDescription" & "price" of the products purchased
     * @returns {number}
     */
    const calcEveryTwoItems = (items) => {
      let numberOfItems = items.length;
      return Math.floor(numberOfItems / 2) * 5;
    };

    /**
     * If the trimmed length of the item description is a multiple of 3,
     * multiply the price by `0.2` and round up to the nearest integer.
     * The result is the number of points earned.
     * for example: the given string is "  Emils Cheese Pizza     "
     * after triming the string becomes "Emils Cheese Pizza"
     * the length of the string is 18
     * now this length divided by 3 the remainder is zero thus,
     * multiply the the price of that item by 0.2 and round it up.
     * @param {object} item - it has two major things "shortDescription" & "price" of the products purchased
     * @returns {number} - points earned
     */
    const calcItemDescriptCost = (items) => {
      let points = 0;
      for (let i = 0; i < items.length; i++) {
        let str = items[i].shortDescription;
        str = str.trim();
        if (str.length % 3 === 0) {
          let cost = items[i].price * 0.2;
          points += Math.ceil(cost);
        }
      }
      return points;
    };

    /**
     * 6 points if the day in the purchase date is odd.
     * the purchaseDate value is YYYY-MM-DD format
     * @param {string} purchaseDate - Date of purchase, given in the POST-API request.
     */
    const calcPurchaseDateOdd = (purchaseDate) => {
      let [year, month, day] = purchaseDate.split("-").map(Number);

      if (day % 2 !== 0) {
        return 6;
      }
      return 0;
    };
    /**
     * 10 points if the time of purchase is after 2:00pm and before 4:00pm.
     * the time is in 24hr time
     * @param {string} purchaseTime - Time of purchase, given in the POST-API request.
     * @return {number}
     */
    const calcTimeOfPur = (purchaseTime) => {
      if (purchaseTime >= "14:00" && purchaseTime <= "16:00") {
        return 10;
      }
      return 0;
    };

    const calcTotalPoints = () => {
      points =
        calcAlphaNumericChar(receiptData.retailer) +
        roundDollarAmt(receiptData.total) +
        multipleOf0_25(receiptData.total) +
        calcEveryTwoItems(receiptData.items) +
        calcItemDescriptCost(receiptData.items) +
        calcPurchaseDateOdd(receiptData.purchaseDate) +
        calcTimeOfPur(receiptData.purchaseTime);

      return points;
    };

    res.status(200).json({ points: calcTotalPoints() });
  } catch (error) {
    console.log("The error", error.status);
    const status = error.status || 500;
    // the below part is commented out only because I am still debugging and developing.
    if (status === 500) {
      error.message = "Internal server error";
    } else {
      error.message = "No receipt found for that ID.";
    }
    res.status(status).json({
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`App running on ${PORT}`);
});
