const mongoose = require("mongoose");

const updateSchema = new mongoose.Schema({
  //   userId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //     required: true,
  //   },
  //   username: String,

  userId: mongoose.Schema.Types.ObjectId,

  pHLevel: Number,
  ppm: Number,
  temp: Number,

  //added data form argie
  dw: Number,
  rw: Number,
  reservoir: Number,
  up: Number,
  dwn: Number,
  nutr: Number,
  tmp: Number,
  ph: Number,
  tds: Number,
});

mongoose.model("Update", updateSchema);
