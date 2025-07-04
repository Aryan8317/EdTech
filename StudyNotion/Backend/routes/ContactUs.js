const express = require("express")
const router = express.Router()
const {contactUs}=require("../controllers/Contactus");




router.post("/contactUs", contactUs);

module.exports = router;
