const Categories = require("../models/categoriesModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");
const cloudinary = require("cloudinary");

exports.createCategories = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      name,
      idCode,
      image,
      levelAgency,
      isShow,
      commission,
      description,
    } = req.body;

    if (!image) {
      return next(new ErrorHander("Không có hình ảnh", 400));
    }

    const result = await cloudinary.v2.uploader.upload(image, {
      folder: "cate",
    });

    const categories = await Categories.create({
      name,
      idCode,
      levelAgency,
      isShow,
      commission,
      description,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    responseData(categories, 200, "Tạo danh mục sản phẩm mới thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

exports.getAllCategories = catchAsyncErrors(async (req, res, next) => {
  const { page = 0, size = 10, search } = req.query;
  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  const query = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }];
  }
  const categories = await Categories.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Categories.countDocuments(query);

  const pagination = {
    total,
    page: parseInt(page),
    size: parseInt(size),
  };

  responseData(
    { categories, pagination },
    200,
    "Lấy danh sách danh mục thành công",
    res
  );
});
exports.getAllCategoriesNoPage = catchAsyncErrors(async (req, res, next) => {
  const categories = await Categories.find();
  responseData(categories, 200, null, res);
});
exports.updateCategories = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      name,
      idCode,
      levelAgency,
      isShow,
      commission,
      description,
      image,
    } = req.body;

    const newData = {
      name,
      idCode,
      levelAgency,
      isShow,
      commission,
      description,
    };

    if (image) {
      const result = await cloudinary.v2.uploader.upload(image, {
        folder: "cate",
      });
      newData.image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const categories = await Categories.findByIdAndUpdate(req.params.id, newData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    if (!categories) {
      return next(new ErrorHander("Không tìm thấy danh mục sản phẩm", 404));
    }

    responseData(categories, 200, "Chỉnh sửa thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

exports.deleteCategories = catchAsyncErrors(async (req, res, next) => {
  const categories = await Categories.findByIdAndDelete(req.params.id);

  if (!categories) {
    return next(new ErrorHander("Không tìm thấy danh mục sản phẩm", 404));
  }

  responseData(null, 200, "Xoá dữ liệu thành công", res);
});

// Lấy chi tiết danh mục sản phẩm
exports.getCategoryDetail = catchAsyncErrors(async (req, res, next) => {
  const category = await Categories.findById(req.params.id);

  if (!category) {
    return next(new ErrorHander("Không tìm thấy danh mục sản phẩm", 404));
  }

  responseData(category, 200, "Lấy chi tiết danh mục thành công", res);
});
