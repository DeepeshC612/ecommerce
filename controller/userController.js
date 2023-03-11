const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../services/emailService");
const userModelSchema = require("../models/userModelSchema");

const userSignUp = async (req, res) => {
  const registerData = await new userModelSchema(req.body);
  const isEmailExists = await userModelSchema.findOne({
    userEmail: req.body.userEmail,
  });
  if (isEmailExists) {
    res.status(409).json({
      success: "failure",
      message: "User already exists with this email",
    });
  } else {
    try {
      const salt = await bcrypt.genSalt(10);
      registerData.userPassword = await bcrypt.hash(
        req.body.userPassword,
        salt
      );
      const filePath = `/uploads/${req.file.filename}`;
      registerData.profilePic = filePath;
      await registerData.save();
      res.status(201).json({
        success: "success",
        message: "Registration successfully",
      });
    } catch (err) {
      res.status(400).json({
        success: "failure",
        error: "Error occur " + err.message,
      });
    }
  }
};

const userLogin = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;
    if (userEmail && userPassword) {
      const userData = await userModelSchema.findOne({ userEmail: userEmail });
      if (userData != null) {
        const isPasswordMatch = await bcrypt.compare(
          userPassword,
          userData.userPassword
        );
        if (userData.userEmail === userEmail && isPasswordMatch) {
          const token = jwt.sign(
            { userId: userData._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "5d" }
          );
          res.status(200).send({
            success: "success",
            message: "Login successfully",
            token: token,
          });
        } else {
          res.status(401).send({
            success: "failure",
            message: "Email or password is not valid",
          });
        }
      } else {
        res.status(400).json({
          success: "failure",
          message: "You are not a registered user",
        });
      }
    }
  } catch (err) {
    res.status(400).json({
      success: "failure",
      message: "Error occur " + err.message,
    });
  }
};

const resetPasswordSendEmail = async (req, res) => {
  const { userEmail } = req.body;
  try {
    const user = await userModelSchema.findOne({ userEmail: userEmail });
    if (user != null) {
      const secret = process.env.JWT_SECRET_KEY;
      const token = jwt.sign({ userID: user.id }, secret, {
        expiresIn: "20m",
      });
      const emailSend = sendEmail(userEmail, token);
      return res.status(201).json({
        success: "success",
        message: "Email sent successfully",
        token: token,
        userID: user.id,
      });
    } else {
      res.status(403).json({
        success: "failure",
        message: "Your not registered user",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: "failure",
      message: "Error occur " + err.message,
    });
  }
};

const userResetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { newPassword, confirmPassword } = req.body;
  try {
    const checkUser = await userModelSchema.findById(id);
    if (checkUser != null) {
      const secretKey = process.env.JWT_SECRET_KEY;
      jwt.verify(token, secretKey);
      if (newPassword === confirmPassword) {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(confirmPassword, salt);
        await userModelSchema.findByIdAndUpdate(checkUser._id, {
          $set: { password: password },
        });
        res.status(200).json({
          success: "success",
          message: "Password update successfully",
        });
      } else {
        res.status(400).json({
          success: "failure",
          message: "Password and confirm password is not match",
        });
      }
    } else {
      res.status(403).json({
        success: "failure",
        message: "You are not registered user",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: "failure",
      message: "Error occur " + err.message,
    });
  }
};

module.exports = {
  userSignUp,
  userLogin,
  resetPasswordSendEmail,
  userResetPassword,
};
