const jwt = require("jsonwebtoken");
const userSchema = require("../models/userModelSchema");

const checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  console.log(req.headers);
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1];
      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = await userSchema.findById(userID).select("-password");
      next();
    } catch (err) {
      res.status(401).send({
        success: "failure",
        message: "Unauthorised User" + err.message,
      });
    }
  }
  if (!token) {
    res.status(401).send({
      message: "Unauthorised User No Token",
    });
  }
};

const isUser = async (req, res, next) => {
  let userRole = req.body.userRole;
  if (userRole) {
    if (userRole === "user") {
      next();
    } else {
      res.status(400).json({
        message: "Role is not user",
      });
    }
  } else {
    res.status(400).json({
      message: "User role is not present",
    });
  }
};

const isVendor = async (req, res, next) => {
  let vendorRole = req.body.vendorRole;
  if (vendorRole) {
    if (vendorRole === "vendor") {
      next();
    } else {
      res.status(400).json({
        message: "Its not vendor",
      });
    }
  } else {
    res.status(400).json({
      message: "vendor role is not present",
    });
  }
};

module.exports = {
  checkUserAuth,
  isUser,
  isVendor,
};
