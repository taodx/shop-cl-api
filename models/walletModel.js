const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  code: {
    type: String,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Đang chờ xử lý",
  },
  message: {
    type: String,
  },
  note: {
    type: String,
  },
  type: {
    type: String,
  },
  handler: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    // required: true,
  },
}, { timestamps: true});

module.exports = mongoose.model("Wallet", walletSchema);
