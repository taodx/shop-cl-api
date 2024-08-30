const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nhập tên danh mục"],
    trim: true,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categories",
    required: [true, "Nhập danh mục sản phẩm"],
  },
  status: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Banner", bannerSchema);
