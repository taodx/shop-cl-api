const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    idCode: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
    },
    name: {
      type: String,
      required: [true, "Nhập tên"],
      maxLength: [30, "Tên tối đa 30 ký tự"],
      minLength: [4, "Tối thiểu 4 ký tự"],
    },
    username: {
      type: String,
      required: [true, "Nhập tên tài khoản"],
      maxLength: [30, "Tên tài khoản tối đa 30 ký tự"],
      minLength: [4, "Tối thiểu 4 ký tự"],
      unique: true,
    },
    email: {
      type: String,
      validate: [validator.isEmail, "Định dạng email không đúng"],
    },
    password: {
      type: String,
      required: [true, "Nhập mật khẩu"],
      minLength: [6, "Mật khẩu tối thiểu 6 ký tự"],
      select: false,
    },
    phone: {
      type: String,
    },
    inviteCode: {
      type: String,
    },
    importInviteCode: {
      type: String,
    },
    level: {
      type: Number,
      default: 1,
    },
    isMarketing: {
      type: Boolean,
      default: false,
    },
    userInvite: {
      name: String,
      email: String,
      username: String,
      inviteCode: String,
      _id: String,
    },
    userHasInvite: [
      {
        name: String,
        email: String,
        username: String,
        inviteCode: String,
        _id: String,
      },
    ],
    point: {
      type: Number,
      default: 0,
    },
    bank: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bank",
      },
    ],
    status: {
      type: String,
      default: "Hoạt động",
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    address: [{ type: mongoose.Schema.Types.ObjectId, ref: "AddressUser" }],
    wallet: {
      surplus: {
        type: Number,
        default: 0,
      },
      freeze: {
        type: Number,
        default: 0,
      },
      deposit: {
        type: Number,
        default: 0,
      },
      withdraw: {
        type: Number,
        default: 0,
      },
      commission: {
        type: Number,
        default: 0,
      },
      order: {
        type: Number,
        default: 0,
      },
      returnOrder: {
        type: Number,
        default: 0,
      },
      bonus: {
        type: Number,
        default: 0,
      },
    },
    position: {
      type: String,
      default: "Người dùng",
    },
    role: {
      type: String,
      default: "Tài khoản thường",
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare Password

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
