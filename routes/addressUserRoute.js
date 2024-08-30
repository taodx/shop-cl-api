const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createAddress,
  getAllAddresses,
  updateAddress,
  setDefaultAddress,
} = require("../controllers/addressController");

const router = express.Router();
router.route("/user/address").post(isAuthenticatedUser, createAddress);
router.route("/user/address/:userId").get(isAuthenticatedUser, getAllAddresses);
router
  .route("/user/address/:addressId")
  .put(isAuthenticatedUser, updateAddress);
router
  .route("/user/address/default/:addressId")
  .put(isAuthenticatedUser, setDefaultAddress);
module.exports = router;
