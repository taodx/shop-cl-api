const mongoose = require("mongoose");

const configWebsiteSchema = new mongoose.Schema(
  {
    nameWebsite: {
      type: String,
      default: "Shoppe",
    },
    baoTri: {
      type: Boolean,
      default: false,
    },
    minRut: {
      type: Number,
      default: 1000000,
    },
    maxRut: {
      type: Number,
      default: 2000000000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ConfigWebsite", configWebsiteSchema);
