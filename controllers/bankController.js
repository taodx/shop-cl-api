const Bank = require("../models/bankModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");
const User = require("../models/userModel");

exports.createBankAccount = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.body.user);
    if (!user) {
      return next(new ErrorHander("Không tìm thấy tài khoản thực hiện!", 404));
    }

    const totalBank = await Bank.find({ user: req.body.user });
    req.body.isDefault = totalBank.length === 0;

    const bank = await Bank.create(req.body);
    user.bank.push(bank._id);
    await user.save();

    responseData(bank, 200, "Tạo tài khoản ngân hàng thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});
exports.getAllBankAccount = catchAsyncErrors(async (req, res, next) => {
  const { page = 0, size = 10, bankName } = req.body;
  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  const query = {};

  if (bankName) {
    query.$or = [{ bankName: { $regex: bankName, $options: "i" } }];
  }

  const banks = await Bank.find(query)
    .skip(skip)
    .limit(limit)
    .populate("user", "_id name")
    .sort({ createdAt: -1 });

  const total = await Bank.countDocuments(query);

  const pagination = {
    total,
    page: parseInt(page),
    size: parseInt(size),
  };

  responseData(
    { banks, pagination },
    200,
    "Lấy danh sách tài khoản ngân hàng thành công",
    res
  );
});

exports.getAllBankAccountByUser = catchAsyncErrors(async (req, res, next) => {
  const { page = 0, size = 10, user, bankName } = req.body;
  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  const query = {};

  if (bankName) {
    query.$or = [{ bankName: { $regex: bankName, $options: "i" } }];
  }
  if (user) {
    query.user = user;
  }
  const banks = await Bank.find(query)
    .skip(skip)
    .limit(limit)
    .populate("user", "_id name")
    .sort({ createdAt: -1 });

  const total = await Bank.countDocuments(query);

  const pagination = {
    total,
    page: parseInt(page),
    size: parseInt(size),
  };

  responseData(
    { banks, pagination },
    200,
    "Lấy danh sách tài khoản theo người dùng ngân hàng thành công",
    res
  );
});
exports.getBankAccountByDefault = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHander("Không tìm thấy tài khoản thực hiện!", 404));
  }
  const isDefaultAccount = await Bank.find({
    user: userId,
    isDefault: true,
  }).populate("user", "name email");
  responseData(
    isDefaultAccount,
    200,
    "Lấy tài khoản mặc định theo người dùng thành công",
    res
  );
});
exports.updateBankAccount = catchAsyncErrors(async (req, res, next) => {
  try {
    const bankAccount = await Bank.findById(req.params.bankId);
    if (!bankAccount) {
      return next(new ErrorHander("Không tìm thấy tài khoản ngân hàng!", 404));
    }

    // Cập nhật các trường
    bankAccount.bankName = req.body.bankName || bankAccount.bankName;
    bankAccount.bankNumber = req.body.bankNumber || bankAccount.bankNumber;
    bankAccount.bankOwner = req.body.bankOwner || bankAccount.bankOwner;
    bankAccount.user = req.body.user || bankAccount.user;

    await bankAccount.save();

    // Cập nhật thông tin trong User nếu cần
    const user = await User.findById(bankAccount.user);
    if (user) {
      const bankIndex = user.bank.findIndex(
        (id) => id.toString() === bankAccount._id.toString()
      );
      if (bankIndex === -1) {
        user.bank.push(bankAccount._id);
        await user.save();
      }
    }

    responseData(bankAccount, 200, "Chỉnh sửa thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

exports.deleteBankAccount = catchAsyncErrors(async (req, res, next) => {
  const bankAccount = await Bank.findByIdAndDelete(req.params.bankId);
  if (!bankAccount) {
    return next(new ErrorHander("Không tìm thấy tài khoản ngân hàng", 404));
  }
  responseData(null, 200, "Xóa thành công", res);
});
