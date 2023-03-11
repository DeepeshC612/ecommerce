const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../services/emailService");
const vendorModelSchema = require("../models/vendorModelSchema");

const vendorSignUp = async (req, res) => {
  const registerData = await new vendorModelSchema(req.body);
  const isEmailExists = await vendorModelSchema.findOne({
    vendorEmail: req.body.vendorEmail,
  });
  if (isEmailExists) {
    res.status(409).json({
      success: "failure",
      message: "Vendor already exists with this email",
    });
  } else {
    try {
      const salt = await bcrypt.genSalt(10);
      registerData.vendorPassword = await bcrypt.hash(
        req.body.vendorPassword,
        salt
      );
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

const vendorLogin = async (req, res) => {
  try {
    const { vendorEmail, vendorPassword } = req.body;
    if (vendorEmail && vendorPassword) {
      const vendorData = await vendorModelSchema.findOne({
        vendorEmail: vendorEmail,
      });
      if (vendorData != null) {
        const isPasswordMatch = await bcrypt.compare(
          vendorPassword,
          vendorData.vendorPassword
        );
        if (vendorData.vendorEmail === vendorEmail && isPasswordMatch) {
          const token = jwt.sign(
            { vendorId: vendorData._id },
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
        res.status(401).json({
          success: "failure",
          message: "You are not a register vendor",
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
  const { vendorEmail } = req.body;
  try {
    const vendor = await vendorModelSchema.findOne({
      vendorEmail: vendorEmail,
    });
    if (vendor != null) {
      const secret = process.env.JWT_SECRET_KEY;
      const token = jwt.sign({ vendorID: vendor.id }, secret, {
        expiresIn: "20m",
      });
      const emailSend = sendEmail(vendorEmail, token);
      return res.status(201).json({
        success: "success",
        message: "Email sent successfully",
        token: token,
        vendorID: vendor.id,
      });
    } else {
      res.status(403).json({
        success: "failure",
        message: "You are not register vendor",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: "failure",
      message: "Error occur " + err.message,
    });
  }
};

const vendorResetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { newPassword, confirmPassword } = req.body;
  try {
    const checkVendor = await vendorModelSchema.findById(id);
    if (checkVendor != null) {
      const secretKey = process.env.JWT_SECRET_KEY;
      jwt.verify(token, secretKey);
      if (newPassword === confirmPassword) {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(confirmPassword, salt);
        await vendorModelSchema.findByIdAndUpdate(checkVendor._id, {
          $set: { password: newHashPassword },
        });
        res.status(200).json({
          success: "success",
          message: "Password updated successfully",
        });
      } else {
        res.status(400).json({
          success: "failure",
          message: "Password and confirm password did not match",
        });
      }
    } else {
      res.status(403).json({
        success: "failure",
        message: "You are not a registered user",
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
  vendorSignUp,
  vendorLogin,
  resetPasswordSendEmail,
  vendorResetPassword,
};
