const mongoose = require("mongoose");

const vendorModelSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: true,
  },
  vendorEmail: {
    type: String,
    required: true,
  },
  vendorPassword: {
    type: String,
    required: true,
  },
  vendorAbout: {
    type: String,
    required: true,
  },
  vendorContact: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  vendorRole: {
    type: String,
    required: true,
    default: "vendor",
  },
  isActive: {
    type: String,
    required: true,
    default: true,
  },
});

vendorModelSchema.set("timestamps", true);
module.exports = mongoose.model("vendor", vendorModelSchema);
