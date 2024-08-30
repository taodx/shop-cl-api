const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Product = require("../models/productModel");
const Brand = require("../models/brandModel");
const Categories = require("../models/categoriesModel");
const ErrorHander = require("../utils/errorhander");
const responseData = require("../utils/responseData");
const cloudinary = require("cloudinary");

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    const { brand, category } = req.body;

    const brandDoc = await Brand.findOne({ _id: brand, status: true });
    const categoryDoc = await Categories.findOne({
      _id: category,
      status: true,
    });
    if (!brandDoc) {
      return next(
        new ErrorHander(
          "Không thể tạo sản phẩm khi trạng thái của nhãn hiệu này chưa được kích hoạt",
          400
        )
      );
    }
    if (!categoryDoc) {
      return next(
        new ErrorHander(
          "Không thể tạo sản phẩm khi trạng thái của danh mục này chưa được kích hoạt",
          400
        )
      );
    }
    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images?.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
    req.body.user = req.user.id;

    // Lấy commission từ category và đặt vào product
    req.body.commission = categoryDoc.commission;

    const product = await Product.create(req.body);

    responseData(product, 200, "Tạo sản phẩm mới thành công", res);
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    category,
    brand,
    isShow,
    status,
    productType,
    page = 0,
    size = 10,
  } = req.body;

  // Tạo đối tượng lọc
  let filter = {};

  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }
  if (category) {
    filter.category = category;
  }
  if (productType) {
    filter.productType = productType;
  }
  if (brand) {
    filter.brand = brand;
  }
  if (isShow === true) {
    filter.isShow = true;
  }
  if (status === true) {
    filter.status = true;
  }
  // Tính toán phân trang
  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  // Lấy danh sách sản phẩm với lọc và phân trang
  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("brand", "_id name")
    .populate("category", "_id name");

  // Đếm tổng số sản phẩm
  const total = await Product.countDocuments(filter);

  // Trả về dữ liệu và thông tin phân trang
  const result = {
    products,
    pagination: {
      total,
      page: parseInt(page),
      size: parseInt(size),
    },
  };

  responseData(result, 200, null, res);
});
exports.updateProductStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return next(new ErrorHander("Không tìm thấy sản phẩm", 404));
    }

    responseData(
      updatedProduct,
      200,
      "Cập nhật trạng thái sản phẩm thành công",
      res
    );
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});

exports.updateProductIsShow = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { isShow } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isShow },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return next(new ErrorHander("Không tìm thấy sản phẩm", 404));
    }

    responseData(
      updatedProduct,
      200,
      "Cập nhật trạng thái sản phẩm thành công",
      res
    );
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id)
      .populate("brand", "_id name")
      .populate("category", "_id name")

    if (!product) {
      return next(new ErrorHander("Không tìm thấy sản phẩm", 404));
    }

    responseData(product, 200, "Lấy chi tiết sản phẩm thành công", res);
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    const { brand, category, images, ...rest } = req.body;

    // Kiểm tra trạng thái của brand và category
    const brandDoc = await Brand.findOne({ _id: brand, status: true });
    const categoryDoc = await Categories.findOne({
      _id: category,
      status: true,
    });

    if (!brandDoc) {
      return next(
        new ErrorHander(
          "Không thể sửa sản phẩm khi trạng thái của nhãn hiệu này chưa được kích hoạt",
          400
        )
      );
    }
    if (!categoryDoc) {
      return next(
        new ErrorHander(
          "Không thể sửa sản phẩm khi trạng thái của danh mục này chưa được kích hoạt",
          400
        )
      );
    }

    let imagesLinks = [];
    if (images && images.length > 0) {
      if (typeof images === "string") {
        imagesLinks.push(images);
      } else {
        imagesLinks = images;
      }

      const uploadedImages = [];
      for (let i = 0; i < imagesLinks.length; i++) {
        const result = await cloudinary.v2.uploader.upload(imagesLinks[i], {
          folder: "products",
        });

        uploadedImages.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
      rest.images = uploadedImages;
    }

    // Cập nhật commission từ category
    rest.commission = categoryDoc.commission;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        brand,
        category,
        ...rest,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return next(new ErrorHander("Không tìm thấy sản phẩm", 404));
    }

    responseData(updatedProduct, 200, "Sửa sản phẩm thành công", res);
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHander("Không tìm thấy sản phẩm", 404));
    }

    // Xóa ảnh sản phẩm trên cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await Product.deleteOne({ _id: req.params.id });

    responseData({}, 200, "Xóa sản phẩm thành công", res);
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});
exports.getTotalProducts = catchAsyncErrors(async (req, res, next) => {
  try {
    const total = await Product.countDocuments();

    responseData({ total }, 200, "Tổng số sản phẩm", res);
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});
