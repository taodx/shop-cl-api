const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createBankAccount,
  getAllBankAccount,
  getAllBankAccountByUser,
  updateBankAccount,
  deleteBankAccount,
  getBankAccountByDefault,
} = require("../controllers/bankController");
const router = express.Router();

router
  .route("/admin/bank-account/create")
  .post(isAuthenticatedUser, createBankAccount);

router
  .route("/admin/bank-account/getALL")
  .post(
    isAuthenticatedUser,
    authorizeRoles("Quản trị viên"),
    getAllBankAccount
  );
router
  .route("/admin/bank-account/update/:bankId")
  .put(isAuthenticatedUser, updateBankAccount);
router
  .route("/admin/bank-account/delete/:bankId")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("Quản trị viên"),
    deleteBankAccount
  );

router
  .route("/bank-account/getAllByUser")
  .post(isAuthenticatedUser, getAllBankAccountByUser);
router
  .route("/bank-account/getBankDefault")
  .post(isAuthenticatedUser, getBankAccountByDefault);

module.exports = router;
