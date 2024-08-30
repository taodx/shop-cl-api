const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nhập tên danh mục"],
    trim: true,
  },
  image: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  idCode: {
    type: String,
    required: [true, "Nhập mã danh mục"],
  },
  levelAgency: {
    type: String,
  },
  commission: {
    type: Number,
    default: 0,
  },
  isShow: {
    type: Boolean,
    default: false,
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
module.exports = mongoose.model("Categories", categoriesSchema);
