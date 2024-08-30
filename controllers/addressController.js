const AddressUser = require("../models/addressUserModel");
const User = require("../models/userModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");

exports.createAddress = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return next(new ErrorHander("Không tìm thấy tài khoản thực hiện!", 404));
    }

    const newAddress = {
      location: req.body.location,
      name: req.body.name,
      phone: req.body.phone,
      user: req.body.userId,
      isDefault: user.address.length === 0,
    };

    const address = await AddressUser.create(newAddress);
    user.address.push(address._id);
    await user.save();

    responseData(address, 200, "Tạo địa chỉ mới thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

// Lấy tất cả địa chỉ của người dùng
exports.getAllAddresses = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).populate("address");
    if (!user) {
      return next(new ErrorHander("Không tìm thấy tài khoản thực hiện!", 404));
    }

    responseData(user.address, 200, "Lấy danh sách địa chỉ thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

// Cập nhật địa chỉ
exports.updateAddress = catchAsyncErrors(async (req, res, next) => {
  try {
    const address = await AddressUser.findById(req.params.addressId);
    if (!address) {
      return next(new ErrorHander("Không tìm thấy địa chỉ!", 404));
    }

    address.location = req.body.location || address.location;
    address.name = req.body.name || address.name;
    address.phone = req.body.phone || address.phone;
    await address.save();

    responseData(address, 200, "Cập nhật địa chỉ thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

// Đặt địa chỉ mặc định
exports.setDefaultAddress = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId).populate("address");
    if (!user) {
      return next(new ErrorHander("Không tìm thấy tài khoản thực hiện!", 404));
    }

    user.address.forEach(async (addr) => {
      const address = await AddressUser.findById(addr._id);
      address.isDefault = addr._id.toString() === req.params.addressId;
      await address.save();
    });

    responseData(user.address, 200, "Đặt địa chỉ mặc định thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});
