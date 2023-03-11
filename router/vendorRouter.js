const express = require('express');
const router = express.Router()
const vendor = require('../controller/vendorController')
const { upload } = require('../middlewares/imageStorage');
const auth = require('../middlewares/auth-middleware')

router.post("/signup", upload.single("profilePic"),vendor.vendorSignUp)
router.post("/login",auth.isVendor,vendor.vendorLogin)
router.post("/sendemail",vendor.resetPasswordSendEmail)
router.post("/vendorResetPassword/:id/:token",vendor.vendorResetPassword)

module.exports = router;