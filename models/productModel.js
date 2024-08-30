const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nhập tên sản phẩm"],
    trim: true,
  },
  code:{
    type: String,
    default: () => Math.floor(1000 + Math.random() * 9000).toString(),
  },
  description: {
    type: String,
    required: [true, "Nhập mô tả"],
  },
  price: {
    type: Number,
    required: [true, "Nhập giá"],
    maxLength: [20, "Giá tối đa 8 ký tự"],
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
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: [true, "Nhập nhãn hiệu sản phẩm"],
  },
  isShow: {
    type: Boolean,
    default: false,
  },
  count: {
    type: Number,
    default: 0,
  },
  productType: {
    type: String,
  },
  commission: {
    type: Number,
    default: 0,
  },
  status: {
    type: Boolean,
    default: true,
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
module.exports = mongoose.model("Product", productSchema);
