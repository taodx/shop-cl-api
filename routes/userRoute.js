const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  createUser,
  deleteUser,
  changeUserStatus,
  getAllUserNotPage,
  getUserDetails,
  updateProfile,
  updatePassword,
  getSingleUser,
  resetUserPassword,
  updateUser,
} = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router
  .route("/admin/getAll")
  .post(isAuthenticatedUser, authorizeRoles("Quản trị viên"), getAllUsers);
router
  .route("/admin/user/create")
  .post(isAuthenticatedUser, authorizeRoles("Quản trị viên"), createUser);

router.route("/me").get(isAuthenticatedUser, getUserDetails);

router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("Quản trị viên"), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles("Quản trị viên"), updateUser);
router
  .route("/admin/user/delete/:id")
  .delete(isAuthenticatedUser, authorizeRoles("Quản trị viên"), deleteUser);

router.route("/me/update").put(isAuthenticatedUser, updateProfile);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("Quản trị viên"), getAllUserNotPage);

router
  .route("/admin/user/status/:id")
  .put(isAuthenticatedUser, authorizeRoles("Quản trị viên"), changeUserStatus);

router
  .route("/admin/reset-password")
  .post(
    isAuthenticatedUser,
    authorizeRoles("Quản trị viên"),
    resetUserPassword
  );

module.exports = router;
