const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  requestWithdraw,
  // depositMoney,
  confirmWithdraw,
  getWithdrawRequests,
  getDepositRequests,
  getWithdrawHistoryByCustomer,
  getDepositHistoryByCustomer,
  depositMoneyRequest,
  confirmDeposit,
  getTotalDepositAmount,
  getTotalWithdrawAmount,
  getCompletedRequests,
  createTransaction,
  getTotalCommissionAmount,
} = require("../controllers/walletController");
const {
  getTotalWalletAmountsByPeriod,
} = require("../controllers/userController");

const router = express.Router();

// Yêu cầu rút tiền
router
  .route("/customer/wallet/withdraw-money")
  .post(isAuthenticatedUser, requestWithdraw);

// Xác nhận yêu cầu rút tiền
router
  .route("/admin/wallet/withdraw-money/:id")
  .put(isAuthenticatedUser, authorizeRoles("Quản trị viên"), confirmWithdraw);

router
  .route("/customer/wallet/deposit-money")
  .post(isAuthenticatedUser, depositMoneyRequest);

router
  .route("/admin/wallet/deposit-money/:id")
  .put(isAuthenticatedUser, authorizeRoles("Quản trị viên"), confirmDeposit);

// Nạp tiền cho khách hàng
// router.route("/user/wallet/deposit").post(isAuthenticatedUser, depositMoney);

// Lấy danh sách yêu cầu rút tiền
router
  .route("/admin/wallet/withdraw-requests")
  .post(
    isAuthenticatedUser,
    authorizeRoles("Quản trị viên"),
    getWithdrawRequests
  );

// Lấy danh sách nạp tiền
router
  .route("/admin/wallet/deposit-requests")
  .post(
    isAuthenticatedUser,
    authorizeRoles("Quản trị viên"),
    getDepositRequests
  );

// Lấy lịch sử yêu cầu rút tiền theo ID khách hàng
router
  .route("/user/wallet/withdraw-history/:customerId")
  .get(isAuthenticatedUser, getWithdrawHistoryByCustomer);

// Lấy lịch sử nạp tiền theo ID khách hàng
router
  .route("/user/wallet/deposit-history/:customerId")
  .get(isAuthenticatedUser, getDepositHistoryByCustomer);

router
  .route("/admin/wallet/deposit-requests/total")
  .post(
    isAuthenticatedUser,
    authorizeRoles("Quản trị viên"),
    getTotalDepositAmount
  );

router
  .route("/admin/wallet/withdraw-requests/total")
  .post(
    isAuthenticatedUser,
    authorizeRoles("Quản trị viên"),
    getTotalWithdrawAmount
  );

router
  .route("/admin/wallet/commission-requests/total")
  .post(
    isAuthenticatedUser,
    authorizeRoles("Quản trị viên"),
    getTotalCommissionAmount
  );

router.post(
  "/admin/completed-requests",
  isAuthenticatedUser,
  authorizeRoles("Quản trị viên"),
  getCompletedRequests
);

router.post(
  "/admin/create-transaction",
  isAuthenticatedUser,
  authorizeRoles("Quản trị viên"),
  createTransaction
);

router.post(
  "/admin/wallet/total-wallet-users",
  isAuthenticatedUser,
  authorizeRoles("Quản trị viên"),
  getTotalWalletAmountsByPeriod
);

module.exports = router;
