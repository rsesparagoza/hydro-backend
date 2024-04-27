const mongoose = require("mongoose");

const controlsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: String,
    rainwater: Boolean,
    deepwell: Boolean,
    reservoir: Boolean,
    phUp: Boolean,
    phDown: Boolean,
    nutrients: Boolean,

    created_at: Date,
    updated_at: Date,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

mongoose.model("Control", controlsSchema);
