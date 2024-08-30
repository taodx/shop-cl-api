const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createLogoHeader,
  updateLogoHeader,
  getLogoHeaderDetail,
} = require("../controllers/logoHeaderController");

const router = express.Router();

router.route("/admin/logo/header").post(createLogoHeader);

router.route("/admin/logo/header/:id").put(updateLogoHeader);
router.route("/admin/logo/header/:id").get(getLogoHeaderDetail);
module.exports = router;
