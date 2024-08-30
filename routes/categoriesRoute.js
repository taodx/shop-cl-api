const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createCategories,
  getAllCategories,
  updateCategories,
  deleteCategories,
  getAllCategoriesNoPage,
  getCategoryDetail,
} = require("../controllers/categoriesController");
const router = express.Router();
/**
 * @swagger
 * /admin/categories/create:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Tạo danh mục mới
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Danh mục được tạo thành công
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /admin/categories/all:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lấy tất cả danh mục
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Trả về danh sách tất cả danh mục
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /admin/categories/edit/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Cập nhật danh mục
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật danh mục thành công
 *       404:
 *         description: Không tìm thấy danh mục
 */

/**
 * @swagger
 * /admin/categories/delete/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Xóa danh mục
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa danh mục thành công
 *       404:
 *         description: Không tìm thấy danh mục
 */
router
  .route("/admin/categories/create")
  .post(isAuthenticatedUser, authorizeRoles("Quản trị viên"), createCategories);

router
  .route("/admin/categories/all")
  .post(isAuthenticatedUser, authorizeRoles("Quản trị viên"), getAllCategories);
router.route("/categories/all").get(getAllCategoriesNoPage);

router
  .route("/admin/categories/edit/:id")
  .put(isAuthenticatedUser, authorizeRoles("Quản trị viên"), updateCategories);

router
  .route("/admin/categories/delete/:id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("Quản trị viên"),
    deleteCategories
  );

  router
  .route("/admin/categories/get/:id")
  .get(
    isAuthenticatedUser,
    authorizeRoles("Quản trị viên"),
    getCategoryDetail
  );


module.exports = router;
