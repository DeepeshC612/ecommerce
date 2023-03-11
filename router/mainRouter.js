const express = require("express");
const routers = express.Router();
const userRoutes = require("./userRouter");
const vendorRoutes = require("./vendorRouter");

routers.use("/user", userRoutes);
routers.use("/vendor", vendorRoutes);

module.exports = routers;
