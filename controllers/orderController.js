const Product = require("../models/productModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");
const responseData = require("../utils/responseData");
const Order = require("../models/order");
const User = require("../models/userModel");
const moment = require("moment");
// Tạo đơn hàng
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  const { customer, orderItems, address, orderStatus } = req.body;
  const customerUser = await User.findById(customer);

  if (!customerUser) {
    return next(new ErrorHander("Không tìm thấy khách hàng", 404));
  }

  let totalPrice = 0;
  let totalCommission = 0;

  orderItems.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;
    totalCommission += (item.commission / 100) * itemTotal;
  });

  if (orderStatus === "Đang kiểm duyệt") {
    if (customerUser.wallet.surplus >= totalPrice) {
      customerUser.wallet.surplus -= totalPrice;
    } else {
      return next(new ErrorHander("Số dư ví không đủ", 400));
    }
  }

  const order = await Order.create({
    customer,
    orderItems,
    address,
    totalCommission,
    totalPrice,
    orderStatus,
  });

  await customerUser.save();
  responseData(order, 201, "Tạo đơn hàng thành công", res);
});

// Lấy tất cả đơn hàng trên hệ thống
exports.getAllOrdersAdmin = catchAsyncErrors(async (req, res, next) => {
  const { page = 0, size = 10, search, orderStatus } = req.body;
  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  const query = {};

  if (search) {
    const user = await User.findOne({
      $or: [
        { username: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ],
    });
    if (user) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { customer: user._id },
      ];
    } else {
      query.$or = [{ code: { $regex: search, $options: "i" } }];
    }
  }

  if (orderStatus) query.orderStatus = orderStatus;

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("customer", "username email name")
    .populate("orderItems.product", "name price images category");

  const total = await Order.countDocuments(query);

  const result = {
    orders,
    pagination: {
      total,
      page: parseInt(page),
      size: parseInt(size),
    },
  };

  responseData(result, 200, "Lấy danh sách đơn hàng thành công", res);
});

// Lấy tất cả đơn hàng của khách hàng
exports.getAllOrdersByCustomer = catchAsyncErrors(async (req, res, next) => {
  const { customerId, page = 0, size = 10, orderStatus } = req.body;
  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  if (!customerId) {
    return next(new ErrorHander("Customer ID is required", 400));
  }
  const query = { customer: customerId };

  if (orderStatus) query.orderStatus = orderStatus;

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("customer", "username email name")
    .populate("orderItems.product", "name price images category");

  const total = await Order.countDocuments(query);

  const result = {
    orders,
    pagination: {
      total,
      page: parseInt(page),
      size: parseInt(size),
    },
  };

  responseData(result, 200, "Customer orders fetched successfully", res);
});

// Xem chi tiết đơn hàng
exports.getOrderDetails = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId)
    .populate("customer", "username email name")
    .populate({
      path: "orderItems.product",
      select: "name price images",
      populate: {
        path: "category",
        select: "name commission",
      },
    });

  if (!order) {
    return next(new ErrorHander("Không tìm thấy đơn hàng", 404));
  }

  responseData(order, 200, "Order details fetched successfully", res);
});

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const { status, address } = req.body;

  const order = await Order.findById(orderId).populate("customer");

  if (!order) {
    return next(new ErrorHander("Không tìm thấy đơn hàng", 404));
  }

  if (order.orderStatus === "Hoàn thành" || order.orderStatus === "Hủy") {
    return next(new ErrorHander("Không thể thay đổi trạng thái đơn hàng", 400));
  }

  const customer = order.customer;

  if (status === "Đang kiểm duyệt") {
    if (customer.wallet.surplus < order.totalPrice) {
      return next(new ErrorHander("Không đủ tiền thanh toán", 400));
    }
    customer.wallet.surplus -= order.totalPrice;
    order.orderStatus = status;
  } else if (status === "Hoàn thành") {
    customer.wallet.order += order.totalPrice;
    customer.wallet.commission += order.totalCommission;
    customer.wallet.returnOrder += order.totalCommission + order.totalPrice;
    customer.wallet.surplus += order.totalCommission + order.totalPrice;
    order.orderStatus = status;
    order.deliveredAt = Date.now();

    // Tăng số lượng trường count của sản phẩm
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.count += item.quantity;
        await product.save();
      }
    }
  } else if (status === "Hủy" && order.orderStatus === "Đang kiểm duyệt") {
    customer.wallet.surplus += order.totalPrice;
    order.orderStatus = status;
  } else {
    order.orderStatus = status;
  }

  if (address) {
    order.address = address;
  }

  await customer.save();
  await order.save();

  responseData(order, 200, "Cập nhật trạng thái đơn hàng thành công", res);
});
exports.getTotalOrderAmountByStatusAndPeriod = catchAsyncErrors(
  async (req, res, next) => {
    const { period, status } = req.body;

    if (!["Chờ thanh toán", "Hủy", "Hoàn thành"].includes(status)) {
      return responseData(null, 400, "Trạng thái đơn hàng không hợp lệ", res);
    }

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

    const totalOrderAmount = await Order.aggregate([
      {
        $match: {
          orderStatus: status,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalPrice" },
        },
      },
    ]);

    const result = {
      totalAmount:
        totalOrderAmount.length > 0 ? totalOrderAmount[0].totalAmount : 0,
    };

    responseData(
      result,
      200,
      `Tổng tiền đơn hàng với trạng thái ${status} trong khoảng thời gian ${period} thành công`,
      res
    );
  }
);
