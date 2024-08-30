const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createOrder,
  getAllOrdersAdmin,
  getAllOrdersByCustomer,
  updateOrderStatus,
  getOrderDetails,
  getTotalOrderAmountByStatusAndPeriod,
} = require("../controllers/orderController");
const router = express.Router();

router.route("/user/order/create").post(isAuthenticatedUser, createOrder);

router
  .route("/admin/orders")
  .post(
    isAuthenticatedUser,
    authorizeRoles("Quản trị viên"),
    getAllOrdersAdmin
  );

router.route("/user/orders").post(isAuthenticatedUser, getAllOrdersByCustomer);

router.route("/user/order/:orderId").get(isAuthenticatedUser, getOrderDetails);

router
  .route("/user/order/:orderId")
  .put(isAuthenticatedUser, updateOrderStatus);

router
  .route("/admin/orders/total")
  .post(
    isAuthenticatedUser,
    authorizeRoles("Quản trị viên"),
    getTotalOrderAmountByStatusAndPeriod
  );

module.exports = router;
