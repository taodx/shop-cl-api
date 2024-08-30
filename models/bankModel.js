const mongoose = require("mongoose");

const BankAccountSchema = new mongoose.Schema({
  bankName: {
    type: String,
    trim: true,
  },
  bankNumber: {
    type: String,
    trim: true,
  },
  bankOwner: {
    type: String,
    trim: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  user: { type: mongoose.Schema.ObjectId, ref: "User" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Bank", BankAccountSchema);
