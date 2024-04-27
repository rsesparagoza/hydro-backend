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

router.get("/", (req, res) => {
  res.send("Hello, World!");
});

router.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    confirmPassword,
    contactNumber,
  } = req.body;
  const rainwater = 0;
  const deepwell = 0;
  const reservoir = 0;
  const phUp = 0;
  const phDown = 0;
  const nutrients = 0;
  const pHLevel = 0;
  const ppm = 0;
  const temp = 0;
  const rainwaterBoolean = false;
  const deepwellBoolean = false;
  const reservoirBoolean = false;
  const phUpBoolean = false;
  const phDownBoolean = false;
  const nutrientsBoolean = false;

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }, { contactNumber }],
    });
    if (existingUser) {
      return res
        .status(422)
        .send("Username/Email/Contact Number already exists");
    } else {
      const user = new User({
        userId: null,
        firstName,
        lastName,
        username,
        email,
        password,
        confirmPassword,
        contactNumber,
      });

      await user.save();

      user.userId = user._id;
      await user.save();

      const existingLevel = await Level.findOne({ $or: [{ username }] });
      if (existingLevel) {
        return res.status(422).send("Username already exists");
      } else {
        const level = new Level({
          userId: user._id,
          username,
          rainwater,
          deepwell,
          reservoir,
          phUp,
          phDown,
          nutrients,
        });

        await level.save();

        const existingReadings = await Update.findOne({ $or: [{ username }] });
        if (existingReadings) {
          return res.status(422).send("Username already exists");
        } else {
          const readings = new Update({
            userId: user._id,
            username,
            pHLevel,
            ppm,
            temp,
          });

          await readings.save();

          const existingControls = await Control.findOne({
            $or: [{ username }],
          });
          if (existingControls) {
            return res.status(422).send("Username already exists");
          } else {
            const controls = new Control({
              userId: user._id,
              username,
              rainwater: rainwaterBoolean,
              deepwell: deepwellBoolean,
              reservoir: reservoirBoolean,
              phUp: phUpBoolean,
              phDown: phDownBoolean,
              nutrients: nutrientsBoolean,
            });

            await controls.save();

            const token = jwt.sign({ userId: user._id }, jwtkey);

            console.log("User ID:", user._id);
            console.log("Token: " + token);

            res.send({ token });
          }
        }
      }
    }
  } catch (err) {
    console.error("Error in registering:", err);
    return res.status(500).send("Internal server error");
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(422)
      .send({ error: "You must provide username or password" });
  }
  const user = await User.findOne({ username });
  if (!user) {
    console.log(user);
    return res
      .status(422)
      .send({ error: "You must provide username or password" });
  }
  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, jwtkey);
    res.send({ token });
  } catch (err) {
    return res
      .status(422)
      .send({ error: "You must provide username or password" });
  }
});

router.get("/user", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(401).json({ error: "Invalid token format" });
    }
    const tokenString = tokenParts[1];
    const decodedToken = jwt.verify(tokenString, jwtkey);
    const userId = decodedToken.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.username) {
      return res.status(500).json({ error: "Username not found for user" });
    }

    res.json({
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      contactNumber: user.contactNumber,
    });
  } catch (error) {
    console.error("Error retrieving user:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/editProfile", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const tokenParts = token.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    return res.status(401).json({ error: "Invalid token format" });
  }
  const tokenString = tokenParts[1];
  const decodedToken = jwt.verify(tokenString, jwtkey);
  const { username, contactNumber, email } = req.body;
  const userId = decodedToken.userId;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email, contactNumber },
      { new: true }
    );
    res.json({ message: "Profile updated successfully", user: updatedUser });
    console.log(req.body);
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).send("Internal server error");
  }
});

router.post("/updatePassword", async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(401).json({ error: "Invalid token format" });
    }
    const tokenString = tokenParts[1];
    const decodedToken = jwt.verify(tokenString, jwtkey);
    const { oldPassword, password, confirmPassword } = req.body;
    const userId = decodedToken.userId;

    console.log("New profile data:", {
      oldPassword,
      password,
      confirmPassword,
    });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.confirmPassword !== oldPassword) {
      return res.status(422).send("Old password does not match");
    }
    user.password = password;
    user.confirmPassword = confirmPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).send("Internal server error");
  }
});

router.get("/tankLevels", async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(401).json({ error: "Invalid token format" });
    }
    const tokenString = tokenParts[1];
    const decodedToken = jwt.verify(tokenString, jwtkey);

    const userId = decodedToken.userId;

    if (!userId) {
      return res.status(404).json({ error: "User ID not found in token" });
    }

    const level = await Level.find({ userId: userId });
    if (!level || level.length === 0) {
      return res
        .status(404)
        .json({ error: "Levels not found for the database" });
    }

    const levels = level[0];

    res.json({
      username: levels.username,
      rainwater: levels.rainwater,
      deepwell: levels.deepwell,
      reservoir: levels.reservoir,
      phUp: levels.phUp,
      phDown: levels.phDown,
      nutrients: levels.nutrients,
    });
  } catch (error) {
    console.error("Error retrieving levels:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/updateTankLevels", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const tokenParts = token.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    return res.status(401).json({ error: "Invalid token format" });
  }
  const tokenString = tokenParts[1];
  const decodedToken = jwt.verify(tokenString, jwtkey);
  const { rainwater, reservoir, deepwell, phUp, phDown, nutrients } = req.body;
  const userId = decodedToken.userId;

  const levelId = await Level.find({ userId: userId });

  try {
    const updatedLevels = await Level.findByIdAndUpdate(
      levelId,
      { rainwater, reservoir, deepwell, phUp, phDown, nutrients },
      { new: true }
    );

    res.json({
      message: "Tank Levels updated successfully",
      level: updatedLevels,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).send("Internal server error");
  }
});

router.get("/readings", async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(401).json({ error: "Invalid token format" });
    }
    const tokenString = tokenParts[1];
    const decodedToken = jwt.verify(tokenString, jwtkey);

    const userId = decodedToken.userId;

    if (!userId) {
      return res.status(404).json({ error: "User ID not found in token" });
    }

    const update = await Update.find({ userId: userId });
    if (!update || update.length === 0) {
      return res
        .status(404)
        .json({ error: "Updates not found for the database" });
    }

    const updates = update[0];

    res.json({
      username: updates.username,
      pHLevel: updates.pHLevel,
      ppm: updates.ppm,
      temp: updates.temp,
    });
  } catch (error) {
    console.error("Error retrieving levels:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/updateReadings", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const tokenParts = token.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    return res.status(401).json({ error: "Invalid token format" });
  }
  const tokenString = tokenParts[1];
  const decodedToken = jwt.verify(tokenString, jwtkey);
  const { pHLevel, ppm, temp } = req.body;
  const userId = decodedToken.userId;

  const updatesId = await Update.find({ userId: userId });

  try {
    const updatedReadings = await Update.findByIdAndUpdate(
      updatesId,
      { pHLevel, ppm, temp },
      { new: true }
    );

    res.json({
      message: "Readings updated successfully",
      update: updatedReadings,
    });
  } catch (error) {
    console.error("Error updating readings:", error);
    return res.status(500).send("Internal server error");
  }
});

router.post("/sendVerCode", async (req, res) => {
  try {
    const { contactNumber, verificationCode } = req.body;
    let formattedContactNumber = contactNumber;

    if (!contactNumber.startsWith("+")) {
      formattedContactNumber = `+63${contactNumber.substring(1)}`;
    }

    const message = await client.messages.create({
      body: `Ari na ang verification code mo gwyn: ${verificationCode}`,
      from: "+16592011334",
      to: formattedContactNumber,
    });

    console.log("Verification code sent:", message.sid);
    res
      .status(200)
      .json({ success: true, message: "Verification code sent successfully" });
  } catch (error) {
    console.error("Error sending verification code:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send verification code" });
  }
});

router.get("/controls", async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(401).json({ error: "Invalid token format" });
    }
    const tokenString = tokenParts[1];
    const decodedToken = jwt.verify(tokenString, jwtkey);

    const userId = decodedToken.userId;

    if (!userId) {
      return res.status(404).json({ error: "User ID not found in token" });
    }

    const control = await Control.find({ userId: userId });
    if (!control || control.length === 0) {
      return res
        .status(404)
        .json({ error: "Controls not found for the database" });
    }

    const controls = control[0];

    res.json({
      username: controls.username,
      rainwater: controls.rainwater,
      deepwell: controls.deepwell,
      reservoir: controls.reservoir,
      phUp: controls.phUp,
      phDown: controls.phDown,
      nutrients: controls.nutrients,
    });
  } catch (error) {
    console.error("Error retrieving levels:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/updateControls", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const tokenParts = token.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    return res.status(401).json({ error: "Invalid token format" });
  }
  const tokenString = tokenParts[1];
  const decodedToken = jwt.verify(tokenString, jwtkey);
  const { rainwater, deepwell, reservoir, phUp, phDown, nutrients } = req.body;
  const userId = decodedToken.userId;

  const controlsId = await Control.find({ userId: userId });

  try {
    const updatedControls = await Control.findByIdAndUpdate(
      controlsId,
      { rainwater, deepwell, reservoir, phUp, phDown, nutrients },
      { new: true }
    );

    res.json({
      message: "Controls updated successfully",
      control: updatedControls,
    });
  } catch (error) {
    console.error("Error updating controls:", error);
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;
