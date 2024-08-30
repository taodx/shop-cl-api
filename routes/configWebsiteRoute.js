const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createConfig,
  updateConfig,
  getConfigDetails,
} = require("../controllers/configWebsiteController");

const router = express.Router();

router
  .route("/admin/config/website")
  .post(isAuthenticatedUser, authorizeRoles("Quản trị viên"), createConfig);

router
  .route("/admin/config/website/:id")
  .put(isAuthenticatedUser, authorizeRoles("Quản trị viên"), updateConfig);
router.route("/config/website/:id").get(getConfigDetails);
module.exports = router;
