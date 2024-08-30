const mongoose = require("mongoose");
const orderPSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
      unique: true,
    },
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      location: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    orderItems: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        commission: {
          type: Number,
        },
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    totalCommission: {
      type: Number,
      required: true,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    orderStatus: {
      type: String,
      required: true,
      default: "Chờ thanh toán",
    },
    handler: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OrderP", orderPSchema);
