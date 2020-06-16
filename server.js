//Imports===============
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/connectDB");
const ErrorHandingMainFunc = require("./router/api/Error&ResSec/ErrorHanding");
dotenv.config({ path: "./config/config.env" }); //connect the config
connectDB();
//Routes================
const app = express();
app.use(express.json()); //Simple Middleware<--- It parsing json obj.
app.use("/api/v1/users", require("./router/api/User/User-Route"));
//Errors Handling============
app.use(ErrorHandingMainFunc); //Main Error Handling Functions
//PORTS============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on ${process.env.NODE_ENV} & PORT is ${PORT}`);
});
