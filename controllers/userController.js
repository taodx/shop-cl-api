const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const crypto = require("crypto");
const responseData = require("../utils/responseData");
const bcrypt = require("bcryptjs");
const moment = require("moment");

// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, username, phone, password, importInviteCode } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return responseData(null, 400, "Username đã tồn tại", res);
  }
  let userInvite = null;
  let position = "Tài khoản thường";
  if (importInviteCode) {
    const inviter = await User.findOne({ inviteCode: importInviteCode });
    if (inviter) {
      userInvite = {
        name: inviter.name,
        email: inviter.email,
        username: inviter.username,
        inviteCode: inviter.inviteCode,
        _id: inviter._id,
      };

      inviter.userHasInvite.push({
        name,
        email: req.body.email || "",
        username,
      });
      if (inviter.role === "Quản trị viên") {
        position = "Đại lý";
      }
      await inviter.save();
    } else {
      return next(new ErrorHander("Mã giới thiệu không hợp lệ", 400));
    }
  }

  const newInviteCode = `SP${Math.floor(100000 + Math.random() * 900000)}`;

  const user = await User.create({
    name,
    username,
    phone,
    password,
    inviteCode: newInviteCode,
    userInvite,
    position,
    avatar: {
      public_id: "sample id",
      url: "https://thuvienplus.com/themes/cynoebook/public/images/default-user-image.png",
    },
  });

  sendToken(user, 201, res, "Đăng ký tài khoản thành công");
});

exports.createUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      name,
      username,
      phone,
      password,
      email,
      position,
      importInviteCode,
    } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return next(new ErrorHander("Username đã tồn tại", 400));
    }

    let userInvite = null;
    let role = "Người dùng";
    if (importInviteCode) {
      const inviter = await User.findOne({ inviteCode: importInviteCode });
      if (inviter) {
        userInvite = {
          name: inviter?.name,
          email: inviter?.email,
          username: inviter?.username,
          inviteCode: inviter?.inviteCode,
          _id: inviter?._id,
          idCode: inviter?.idCode,
          phone: inviter?.phone,
        };

        inviter.userHasInvite.push({
          name,
          email: req.body.email || "",
          username,
        });
        if (inviter.role === "Quản trị viên") {
          position = "Đại lý";
        }
        await inviter.save();
      } else {
        return next(new ErrorHander("Mã giới thiệu không hợp lệ", 400));
      }
    }

    const newInviteCode = `SP${Math.floor(100000 + Math.random() * 900000)}`;

    const user = await User.create({
      name,
      username,
      email,
      phone,
      password,
      inviteCode: newInviteCode,
      position,
      userInvite,
      position,
      avatar: {
        public_id: "sample id",
        url: "https://thuvienplus.com/themes/cynoebook/public/images/default-user-image.png",
      },
    });
    responseData(user, 200, "Tạo tài khoản thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(
      new ErrorHander("Vui lòng nhập tên tài khoản và mật khẩu", 400)
    );
  }

  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    return next(new ErrorHander("Tên tài khoản hoặc mật khẩu không đúng", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Tên tài khoản hoặc mật khẩu không đúng", 400));
  }

  sendToken(user, 200, res, "Đăng nhập thành công");
});

// Get list all
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const { search, position, page = 0, size = 10 } = req.body;
  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
      { idCode: { $regex: search, $options: "i" } },
    ];
  }
  if (position) {
    query.position = position;
  }
  const users = await User.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  responseData(
    {
      users,
      pagination: {
        total,
        page: parseInt(page),
        size: parseInt(size),
      },
    },
    200,
    "Tìm kiếm thành công",
    res
  );
});
exports.getAllUserNotPage = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  responseData(users, 200, null, res);
});

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  responseData(user, 200, null, res);
});

exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: "address",
      select: "_id location name phone isDefault",
    })
    .populate({
      path: "bank",
      select: "_id bankName bankNumber bankOwner isDefault",
    });

  if (!user) {
    return next(
      new ErrorHander(`Người dùng không tồn tại với Id: ${req.params.id}`)
    );
  }

  responseData(user, 200, "Tìm kiếm thành công", res);
});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Mật khẩu cũ không đúng", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("Hai mật khẩu không trùng", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  responseData(user, 200, "Mật khẩu đã được cập nhật thành công", res);
});

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  };
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  responseData(user, 200, "Chỉnh sửa thành công", res);
});

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorHander("Người dùng không tồn tại", 404));
  }

  await User.findByIdAndDelete(id);

  responseData(null, 200, "Xóa tài khoản thành công", res);
});
exports.changeUserStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorHander("Người dùng không tồn tại", 404));
  }

  user.status = status;
  await user.save();

  responseData(user, 200, "Thay đổi trạng thái thành công", res);
});

exports.resetUserPassword = catchAsyncErrors(async (req, res, next) => {
  const { userId, newPassword } = req.body;

  // Kiểm tra xem người dùng có tồn tại không
  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHander("Không tìm thấy tài khoản", 404));
  }

  // Cập nhật mật khẩu mới cho người dùng và đánh dấu là mật khẩu được cấp lại
  user.password = newPassword;
  user.isResetPassword = true;

  await user.save();

  // Tạo token mới
  const token = user.getJWTToken();

  // Thiết lập cookie token
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res
    .status(200)
    .cookie("token", token, options)
    .json({
      success: true,
      message: "Thay đổi mật khẩu thành công",
      data: {
        user,
        forceLogout: true,
      },
    });
});
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    phone: req.body.phone,
    position: req.body.position,
    status: req.body.status,
    level: req.body.level,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return responseData(null, 404, "Không tìm thấy người dùng", res);
  }

  responseData(user, 200, "Cập nhật thành công", res);
});
exports.getTotalWalletAmountsByPeriod = catchAsyncErrors(
  async (req, res, next) => {
    const { period } = req.body;

    let startDate, endDate;

    switch (period) {
      case "today":
        startDate = moment().startOf("day").toDate();
        endDate = moment().endOf("day").toDate();
        break;
      case "this_week":
        startDate = moment().startOf("week").toDate();
        endDate = moment().endOf("week").toDate();
        break;
      case "last_15_days":
        startDate = moment().subtract(15, "days").startOf("day").toDate();
        endDate = moment().endOf("day").toDate();
        break;
      case "this_month":
        startDate = moment().startOf("month").toDate();
        endDate = moment().endOf("month").toDate();
        break;
      case "last_month":
        startDate = moment().subtract(1, "month").startOf("month").toDate();
        endDate = moment().subtract(1, "month").endOf("month").toDate();
        break;
      case "all":
        startDate = new Date(0); // Ngày bắt đầu từ thời điểm Unix epoch
        endDate = new Date(); // Ngày kết thúc là hiện tại
        break;
      default:
        return responseData(null, 400, "Khoảng thời gian không hợp lệ", res);
    }

    const totalWalletAmounts = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalReturnOrder: { $sum: "$wallet.returnOrder" },
          totalSurplus: { $sum: "$wallet.surplus" },
        },
      },
    ]);

    const result = {
      totalReturnOrder:
        totalWalletAmounts.length > 0
          ? totalWalletAmounts[0].totalReturnOrder
          : 0,
      totalSurplus:
        totalWalletAmounts.length > 0 ? totalWalletAmounts[0].totalSurplus : 0,
    };

    responseData(
      result,
      200,
      `Tính tổng tiền trong ví thành công cho khoảng thời gian ${period}`,
      res
    );
  }
);
