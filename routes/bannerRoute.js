const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createBanner,
  updateBanner,
  getBanners,
  getBannerDetail,
  getAllBanners,
  deleteBanner,
} = require("../controllers/bannerController");

const router = express.Router();

router
  .route("/admin/banner/create")
  .post(isAuthenticatedUser, authorizeRoles("Quản trị viên"), createBanner);

router
  .route("/admin/banner/:id")
  .put(isAuthenticatedUser, authorizeRoles("Quản trị viên"), updateBanner);

router.route("/admin/banners").post(getAllBanners);

router.route("/banner/:id").get(getBannerDetail);

router
  .route("/admin/banner/:id")
  .delete(isAuthenticatedUser, authorizeRoles("Quản trị viên"), deleteBanner);

router.get("/banners", getBanners);

module.exports = router;
