const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { jwtkey } = require("../keys");
const router = express.Router();
const User = mongoose.model("User");
const Level = mongoose.model("Level");
const Update = mongoose.model("Update");
const Control = mongoose.model("Control");

require("dotenv").config();

const { accountSid, authToken } = require("../keys");
const TwilioClient = require("twilio")(accountSid, authToken);

router.post("/sensor", async (req, res) => {
  const { dw, rw, res: reservoir, up, dwn, nutr, temp, ph, tds } = req.body;

  console.log(req.body);

  await new Update({
    dw,
    rw,
    reservoir,
    up,
    dwn,
    nutr,
    temp,
    ph,
    tds,
  }).save();

  return res.json(true);
});

module.exports = router;
