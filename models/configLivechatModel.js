const mongoose = require("mongoose");

const ConfigLiveChatSchema = new mongoose.Schema({
  keyLive: {
    type: String,
    trim: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("ConfigLiveChat", ConfigLiveChatSchema);
