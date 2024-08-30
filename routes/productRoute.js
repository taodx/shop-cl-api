const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createProduct,
  getAllProducts,
  updateProductStatus,
  getProductDetails,
  updateProduct,
  deleteProduct,
  getTotalProducts,
  updateProductIsShow,
} = require("../controllers/productController");

const router = express.Router();

/**
 * @swagger
 * /admin/products/all:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Lấy tất cả sản phẩm với lọc và phân trang
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: "Tên sản phẩm"
 *               productType:
 *                 type: string
 *                 description: "ID loại sản phẩm"
 *               category:
 *                 type: string
 *                 description: "ID danh mục sản phẩm"
 *               brand:
 *                 type: string
 *                 description: "ID nhãn hiệu sản phẩm"
 *               page:
 *                 type: integer
 *                 description: "Trang hiện tại, mặc định là 0"
 *               size:
 *                 type: integer
 *                 description: "Số lượng sản phẩm trên mỗi trang, mặc định là 10"
 *     responses:
 *       200:
 *         description: Trả về danh sách sản phẩm với thông tin phân trang
 *       500:
 *         description: Lỗi server
 */

router
  .route("/admin/products/all")
  .post(isAuthenticatedUser, authorizeRoles("Quản trị viên"), getAllProducts);

router.route("/products/all").post(getAllProducts);
router
  .route("/product/:id")
  .get(getProductDetails)
  .put(updateProduct)
  .delete(deleteProduct);
router
  .route("/admin/products")
  .post(isAuthenticatedUser, authorizeRoles("Quản trị viên"), createProduct);

router
  .route("/product/:id/status")
  .put(
    isAuthenticatedUser,
    authorizeRoles("Quản trị viên"),
    updateProductStatus
  );
router
  .route("/product/:id/isShow")
  .put(
    isAuthenticatedUser,
    authorizeRoles("Quản trị viên"),
    updateProductIsShow
  );
router
  .route("/product/total")
  .get(isAuthenticatedUser, authorizeRoles("Quản trị viên"), getTotalProducts);
module.exports = router;
