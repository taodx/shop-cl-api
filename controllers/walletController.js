const Wallet = require("../models/walletModel");
const User = require("../models/userModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");
const ErrorHander = require("../utils/errorhander");
const moment = require("moment");

const generateUniqueCode = async (prefix) => {
  let code;
  let isUnique = false;

  while (!isUnique) {
    const randomNumbers = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    code = `${prefix}${randomNumbers}`;
    const existingWallet = await Wallet.findOne({ code });
    if (!existingWallet) {
      isUnique = true;
    }
  }

  return code;
};

// exports.requestWithdraw = catchAsyncErrors(async (req, res, next) => {
//   const { amount, note } = req.body;

//   const user = await User.findById(req.user._id);

//   if (user.wallet.surplus <= 1000000) {
//     return next(
//       new ErrorHander("Số dư trong ví phải tối thiểu 1.000.000đ", 400)
//     );
//   }

//   if (user.wallet.surplus < amount) {
//     return next(
//       new ErrorHander("Số tiền muốn rút nhiều hơn số tiền có trong ví", 400)
//     );
//   }

//   const code = await generateUniqueCode("RT");

//   const walletRequest = await Wallet.create({
//     customer: req.user._id,
//     amount,
//     note,
//     code,
//     type: "withdraw",
//   });

//   responseData(walletRequest, 201, "Gửi yêu cầu rút tiền thành công", res);
// });

exports.requestWithdraw = catchAsyncErrors(async (req, res, next) => {
  const { amount, note } = req.body;

  const user = await User.findById(req.user._id);

  if (user.wallet.surplus <= 1000000) {
    return next(
      new ErrorHander("Số dư trong ví phải tối thiểu 1.000.000đ", 400)
    );
  }

  if (user.wallet.surplus < amount) {
    return next(
      new ErrorHander("Số tiền muốn rút nhiều hơn số tiền có trong ví", 400)
    );
  }

  const code = await generateUniqueCode("RT");

  const walletRequest = await Wallet.create({
    customer: req.user._id,
    amount,
    note,
    code,
    type: "withdraw",
    status: "Đang chờ xử lý",
  });

  // Trừ số tiền rút khỏi surplus
  user.wallet.surplus -= amount;
  await user.save();

  responseData(walletRequest, 201, "Gửi yêu cầu rút tiền thành công", res);
});

exports.confirmWithdraw = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status, handler, note, message } = req.body;

  const walletRequest = await Wallet.findById(id);

  if (!walletRequest) {
    return next(new ErrorHander("Không thấy yêu cầu thực hiện!", 404));
  }

  const user = await User.findById(walletRequest.customer);
  if (!user) {
    return next(new ErrorHander("Không tìm thấy tài khoản thực hiện!", 404));
  }

  if (status === "Đã hoàn thành") {
    // if (user.wallet.surplus < walletRequest.amount) {
    //   return next(
    //     new ErrorHander("Số tiền cần rút lớn hơn số tiền trong ví!", 400)
    //   );
    // }
    user.wallet.withdraw += walletRequest.amount;
    // user.wallet.surplus -= walletRequest.amount;
    await user.save();
  } else if (status === "Từ chối") {
    // Hoàn lại số tiền về surplus
    user.wallet.surplus += walletRequest.amount;
    await user.save();
  }

  walletRequest.status = status;
  walletRequest.handler = handler;
  walletRequest.note = note;
  walletRequest.message = message;

  await walletRequest.save();

  responseData(walletRequest, 200, "Cập nhật trạng thái thành công", res);
});

exports.depositMoneyRequest = catchAsyncErrors(async (req, res, next) => {
  const { customer, amount, message, note } = req.body;

  if (!customer || !amount) {
    return next(
      new ErrorHander(
        "Yêu cầu nhập thông tin khách hàng hoặc số tiền cần nạp",
        400
      )
    );
  }

  const customerUser = await User.findById(customer);
  if (!customerUser) {
    return next(new ErrorHander("Không tìm thấy thông tin khách hàng", 404));
  }

  const code = await generateUniqueCode("NT");

  const depositRequest = await Wallet.create({
    customer,
    amount,
    message,
    note,
    code,
    type: "deposit",
    status: "Đang chờ xử lý",
  });

  responseData(depositRequest, 201, "Gửi yêu cầu thành công", res);
});

exports.confirmDeposit = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status, handler, note, message } = req.body;

  const walletRequest = await Wallet.findById(id);

  if (!walletRequest) {
    return next(new ErrorHander("Không thấy yêu cầu thực hiện!", 404));
  }

  const user = await User.findById(walletRequest.customer);
  if (!user) {
    return next(new ErrorHander("Không tìm thấy tài khoản thực hiện!", 404));
  }

  if (status === "Đã hoàn thành") {
    user.wallet.deposit += walletRequest.amount;
    user.wallet.surplus += walletRequest.amount;
    await user.save();
  }

  walletRequest.status = status;
  walletRequest.handler = handler;
  walletRequest.note = note;
  walletRequest.message = message;

  await walletRequest.save();

  responseData(walletRequest, 200, "Cập nhật trạng thái thành công", res);
});

// exports.getWithdrawRequests = catchAsyncErrors(async (req, res, next) => {
//   const { page = 0, size = 10, search, status } = req.body;

//   const limit = parseInt(size);
//   const skip = parseInt(page) * limit;

//   let searchQuery = {
//     type: "withdraw",
//     code: { $not: /^CMS/ },
//   };

//   if (search) {
//     searchQuery.$or = [
//       { "customer.name": { $regex: search, $options: "i" } },
//       { "customer.username": { $regex: search, $options: "i" } },
//       { code: { $regex: search, $options: "i" } },
//     ];
//   }

//   if (status) {
//     searchQuery.status = { $regex: status, $options: "i" };
//   }

//   const withdraw = await Wallet.find(searchQuery)
//     .skip(skip)
//     .limit(limit)
//     .sort({ createdAt: -1 })
//     .populate({
//       path: "customer",
//       select: "name username email phone bank",
//       populate: {
//         path: "bank",
//         select: "bankName bankNumber bankOwner", // Chỉ định các trường của bank mà bạn muốn lấy
//       },
//     })
//     .populate("handler", "name username email");

//   const total = await Wallet.countDocuments(searchQuery);

//   const pendingCount = await Wallet.countDocuments({
//     type: "withdraw",
//     status: "Đang chờ xử lý",
//   });

//   const totalCompletedAmount = await Wallet.aggregate([
//     {
//       $match: {
//         type: "withdraw",
//         status: "Đã hoàn thành",
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         totalAmount: { $sum: "$amount" },
//       },
//     },
//   ]);
//   const result = {
//     withdraw,
//     pendingCount,
//     pagination: {
//       total,
//       page: parseInt(page),
//       size: parseInt(size),
//     },
//     totalCompletedAmount:
//       totalCompletedAmount.length > 0 ? totalCompletedAmount[0].totalAmount : 0,
//   };

//   responseData(result, 200, "Lấy danh sách rút tiền thành công", res);
// });

// exports.getDepositRequests = catchAsyncErrors(async (req, res, next) => {
//   const { page = 0, size = 10, search, status } = req.body;

//   const limit = parseInt(size);
//   const skip = parseInt(page) * limit;

//   let searchQuery = {
//     type: "deposit",
//   };

//   if (search) {
//     searchQuery.$or = [
//       { "customer.name": { $regex: search, $options: "i" } },
//       { "customer.username": { $regex: search, $options: "i" } },
//       { code: { $regex: search, $options: "i" } },
//     ];
//   }

//   if (status) {
//     searchQuery.status = { $regex: status, $options: "i" };
//   }

//   const deposits = await Wallet.find(searchQuery)
//     .skip(skip)
//     .limit(limit)
//     .sort({ createdAt: -1 })
//     .populate({
//       path: "customer",
//       select: "name username email phone bank",
//       populate: {
//         path: "bank",
//         select: "bankName bankNumber bankOwner", // Chỉ định các trường của bank mà bạn muốn lấy
//       },
//     })
//     .populate("handler", "name username email");

//   const total = await Wallet.countDocuments(searchQuery);

//   const pendingCount = await Wallet.countDocuments({
//     type: "deposit",
//     status: "Đang chờ xử lý",
//   });

//   const totalCompletedAmount = await Wallet.aggregate([
//     {
//       $match: {
//         type: "deposit",
//         status: "Đã hoàn thành",
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         totalAmount: { $sum: "$amount" },
//       },
//     },
//   ]);
//   const result = {
//     deposits,
//     pendingCount,
//     pagination: {
//       total,
//       page: parseInt(page),
//       size: parseInt(size),
//     },
//     totalCompletedAmount:
//       totalCompletedAmount.length > 0 ? totalCompletedAmount[0].totalAmount : 0,
//   };

//   responseData(result, 200, "Lấy danh sách nạp tiền thành công", res);
// });

exports.getWithdrawRequests = catchAsyncErrors(async (req, res, next) => {
  const { page = 0, size = 10, search, status } = req.body;

  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  let searchQuery = {
    type: "withdraw",
    code: { $not: /^CMS/ },
  };

  if (search) {
    const customerIds = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    const customerIdsArray = customerIds.map((c) => c._id);

    searchQuery.$or = [
      { customer: { $in: customerIdsArray } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    searchQuery.status = { $regex: status, $options: "i" };
  }

  const withdraw = await Wallet.find(searchQuery)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate({
      path: "customer",
      select: "name username email phone bank",
      populate: {
        path: "bank",
        select: "bankName bankNumber bankOwner", // Chỉ định các trường của bank mà bạn muốn lấy
      },
    })
    .populate("handler", "name username email");

  const total = await Wallet.countDocuments(searchQuery);

  const pendingCount = await Wallet.countDocuments({
    type: "withdraw",
    status: "Đang chờ xử lý",
  });

  const totalCompletedAmount = await Wallet.aggregate([
    {
      $match: {
        type: "withdraw",
        status: "Đã hoàn thành",
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);
  const result = {
    withdraw,
    pendingCount,
    pagination: {
      total,
      page: parseInt(page),
      size: parseInt(size),
    },
    totalCompletedAmount:
      totalCompletedAmount.length > 0 ? totalCompletedAmount[0].totalAmount : 0,
  };

  responseData(result, 200, "Lấy danh sách rút tiền thành công", res);
});

exports.getDepositRequests = catchAsyncErrors(async (req, res, next) => {
  const { page = 0, size = 10, search, status } = req.body;

  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  let searchQuery = {
    type: "deposit",
  };

  if (search) {
    const customerIds = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    const customerIdsArray = customerIds.map((c) => c._id);

    searchQuery.$or = [
      { customer: { $in: customerIdsArray } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    searchQuery.status = { $regex: status, $options: "i" };
  }

  const deposits = await Wallet.find(searchQuery)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate({
      path: "customer",
      select: "name username email phone bank",
      populate: {
        path: "bank",
        select: "bankName bankNumber bankOwner", // Chỉ định các trường của bank mà bạn muốn lấy
      },
    })
    .populate("handler", "name username email");

  const total = await Wallet.countDocuments(searchQuery);

  const pendingCount = await Wallet.countDocuments({
    type: "deposit",
    status: "Đang chờ xử lý",
  });

  const totalCompletedAmount = await Wallet.aggregate([
    {
      $match: {
        type: "deposit",
        status: "Đã hoàn thành",
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);
  const result = {
    deposits,
    pendingCount,
    pagination: {
      total,
      page: parseInt(page),
      size: parseInt(size),
    },
    totalCompletedAmount:
      totalCompletedAmount.length > 0 ? totalCompletedAmount[0].totalAmount : 0,
  };

  responseData(result, 200, "Lấy danh sách nạp tiền thành công", res);
});

exports.getWithdrawHistoryByCustomer = catchAsyncErrors(
  async (req, res, next) => {
    const { customerId } = req.params;

    const withdrawHistory = await Wallet.find({
      customer: customerId,
      type: "withdraw",
      code: { $not: /^CMS/ },
    })
      .populate("customer", "name email")
      .populate("handler", "name email");

    responseData(
      withdrawHistory,
      200,
      "Withdraw history fetched successfully",
      res
    );
  }
);

exports.getDepositHistoryByCustomer = catchAsyncErrors(
  async (req, res, next) => {
    const { customerId } = req.params;

    const depositHistory = await Wallet.find({
      customer: customerId,
      type: "deposit",
    })
      .populate("customer", "name email")
      .populate("handler", "name email");

    responseData(
      depositHistory,
      200,
      "Deposit history fetched successfully",
      res
    );
  }
);

exports.getTotalDepositAmount = catchAsyncErrors(async (req, res, next) => {
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

  const totalDepositAmount = await Wallet.aggregate([
    {
      $match: {
        type: "deposit",
        status: "Đã hoàn thành",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const result = {
    totalAmount:
      totalDepositAmount.length > 0 ? totalDepositAmount[0].totalAmount : 0,
  };

  responseData(result, 200, "Lấy tổng số tiền nạp thành công", res);
});

exports.getTotalWithdrawAmount = catchAsyncErrors(async (req, res, next) => {
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

  const totalWithdrawAmount = await Wallet.aggregate([
    {
      $match: {
        type: "withdraw",
        status: "Đã hoàn thành",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const result = {
    totalAmount:
      totalWithdrawAmount.length > 0 ? totalWithdrawAmount[0].totalAmount : 0,
  };

  responseData(result, 200, "Lấy tổng số tiền rút thành công", res);
});

exports.getTotalCommissionAmount = catchAsyncErrors(async (req, res, next) => {
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

  const totalCommissionAmount = await Wallet.aggregate([
    {
      $match: {
        type: "commission",
        status: "Đã hoàn thành",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const result = {
    totalAmount:
      totalCommissionAmount.length > 0
        ? totalCommissionAmount[0].totalAmount
        : 0,
  };

  responseData(result, 200, "Lấy tổng số tiền hoa hồng thành công", res);
});

exports.getCompletedRequests = catchAsyncErrors(async (req, res, next) => {
  const { page = 0, size = 10, type, search } = req.body;

  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  let searchQuery = {
    status: "Đã hoàn thành",
    code: { $regex: "CMS", $options: "i" },
  };

  if (type) {
    searchQuery.type = type;
  }

  let customerIds = [];

  if (search) {
    const customers = await User.find({
      $or: [
        { username: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    customerIds = customers.map((customer) => customer._id);

    searchQuery.$or = [
      { code: { $regex: search, $options: "i" } },
      { customer: { $in: customerIds } },
    ];
  }

  const completedRequests = await Wallet.find(searchQuery)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate("customer", "name username email phone")
    .populate("handler", "name username email");

  const total = await Wallet.countDocuments(searchQuery);

  const totalDepositAmount = await Wallet.aggregate([
    {
      $match: {
        status: "Đã hoàn thành",
        type: "deposit",
        code: { $regex: "CMS", $options: "i" },
        ...(customerIds.length ? { customer: { $in: customerIds } } : {}),
      },
    },
    { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
  ]);

  const totalWithdrawAmount = await Wallet.aggregate([
    {
      $match: {
        status: "Đã hoàn thành",
        type: "withdraw",
        code: { $regex: "CMS", $options: "i" },
        ...(customerIds.length ? { customer: { $in: customerIds } } : {}),
      },
    },
    { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
  ]);

  const totalCommissionAmount = await Wallet.aggregate([
    {
      $match: {
        status: "Đã hoàn thành",
        type: "commission",
        code: { $regex: "CMS", $options: "i" },
        ...(customerIds.length ? { customer: { $in: customerIds } } : {}),
      },
    },
    { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
  ]);

  const result = {
    completedRequests,
    pagination: {
      total,
      page: parseInt(page),
      size: parseInt(size),
    },
    totalDepositAmount:
      totalDepositAmount.length > 0 ? totalDepositAmount[0].totalAmount : 0,
    totalWithdrawAmount:
      totalWithdrawAmount.length > 0 ? totalWithdrawAmount[0].totalAmount : 0,
    totalCommissionAmount:
      totalCommissionAmount.length > 0
        ? totalCommissionAmount[0].totalAmount
        : 0,
  };

  responseData(
    result,
    200,
    "Lấy danh sách yêu cầu đã hoàn thành thành công",
    res
  );
});

//sinh code giao dịch
const generateUniqueCodeAdmin = async (prefix) => {
  let code;
  let isUnique = false;

  while (!isUnique) {
    const randomNumbers = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    code = `${prefix}${randomNumbers}`;
    const existingWallet = await Wallet.findOne({ code });
    if (!existingWallet) {
      isUnique = true;
    }
  }

  return code;
};

exports.createTransaction = catchAsyncErrors(async (req, res, next) => {
  const { customer, type, amount } = req.body;

  if (!customer || !amount || !type) {
    return next(new ErrorHander("Vui lòng nhập đầy đủ thông tin!", 400));
  }

  const user = await User.findById(customer);
  if (!user) {
    return next(new ErrorHander("Không tìm thấy khách hàng!", 404));
  }

  const code = await generateUniqueCodeAdmin("CMS");

  let updateFields = {};
  let transactionType;
  let message;

  switch (type) {
    case "deposit":
      updateFields = {
        $inc: {
          "wallet.surplus": amount,
          "wallet.deposit": amount,
        },
      };
      transactionType = "deposit";
      message = "Hệ thống nạp bù số tiền vào ví người dùng chính";
      break;
    case "withdraw":
      if (user.wallet.surplus < amount) {
        return next(
          new ErrorHander("Số dư không đủ để thực hiện giao dịch!", 400)
        );
      }
      updateFields = {
        $inc: {
          "wallet.surplus": -amount,
          "wallet.withdraw": amount,
        },
      };
      transactionType = "withdraw";
      message = "Hệ thống trừ bù số tiền vào ví người dùng chính";
      break;
    case "commission":
      updateFields = {
        $inc: {
          "wallet.surplus": amount,
          "wallet.commission": amount,
        },
      };
      transactionType = "commission";
      message = "Hệ thống nạp bù số tiền hoa hồng vào ví người dùng chính";
      break;
    case "surplusToFreeze":
      if (user.wallet.surplus < amount) {
        return next(
          new ErrorHander("Số dư không đủ để thực hiện giao dịch!", 400)
        );
      }
      updateFields = {
        $inc: {
          "wallet.surplus": -amount,
          "wallet.freeze": amount,
        },
      };
      transactionType = "surplusToFreeze";
      message = "Hệ thống chuyển tiền từ ví người dùng chính sang ví đóng băng";
      break;
    case "freezeToSurplus":
      if (user.wallet.freeze < amount) {
        return next(
          new ErrorHander("Số dư không đủ để thực hiện giao dịch!", 400)
        );
      }
      updateFields = {
        $inc: {
          "wallet.freeze": -amount,
          "wallet.surplus": amount,
        },
      };
      transactionType = "freezeToSurplus";
      message = "Hệ thống chuyển tiền từ ví đóng băng sang ví người dùng chính";
      break;
    default:
      return next(new ErrorHander("Loại giao dịch không hợp lệ!", 400));
  }

  await User.findByIdAndUpdate(customer, updateFields);

  const transaction = await Wallet.create({
    customer,
    amount,
    message,
    code,
    type: transactionType,
    status: "Đã hoàn thành",
  });

  responseData(transaction, 201, "Giao dịch thành công", res);
});
