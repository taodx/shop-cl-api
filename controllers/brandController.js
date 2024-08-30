const Brand = require("../models/brandModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");
const cloudinary = require("cloudinary");
exports.createBrand = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, isShow, description, status, image } = req.body;

    if (!image) {
      return next(new ErrorHander("Không có hình ảnh", 400));
    }

    const result = await cloudinary.v2.uploader.upload(image, {
      folder: "brands",
    });

    const banner = await Brand.create({
      isShow,
      name,
      description,
      status,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    responseData(banner, 200, "Tạo brand thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});
exports.getAllBrand = catchAsyncErrors(async (req, res, next) => {
  const { page = 0, size = 10, search } = req.query;
  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  const query = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }];
  }
  const banners = await Brand.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Brand.countDocuments(query);

  const pagination = {
    total,
    page: parseInt(page),
    size: parseInt(size),
  };

  responseData(
    { banners, pagination },
    200,
    "Lấy danh sách brand thành công",
    res
  );
});
exports.getAllBrandNoPage = catchAsyncErrors(async (req, res, next) => {
  const brand = await Brand.find();
  responseData(brand, 200, null, res);
});

exports.updateBrand = catchAsyncErrors(async (req, res, next) => {
  try {
    const { isShow, name, description, status, image } = req.body;

    const newData = {
      isShow,
      name,
      description,
      status,
    };

    if (image) {
      const result = await cloudinary.v2.uploader.upload(image, {
        folder: "brands",
      });
      newData.image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const banner = await Brand.findByIdAndUpdate(req.params.id, newData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }).populate("category");

    if (!banner) {
      return next(new ErrorHander("Không tìm thấy brand", 404));
    }

    responseData(banner, 200, "Cập nhật brand thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});
exports.getBrandDetail = catchAsyncErrors(async (req, res, next) => {
  const banner = await Brand.findById(req.params.id);

  if (!banner) {
    return next(new ErrorHander("Không tìm thấy brand", 404));
  }

  responseData(banner, 200, "Lấy chi tiết brand thành công", res);
});
exports.deleteBrand = catchAsyncErrors(async (req, res, next) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);

  if (!brand) {
    return next(new ErrorHander("Không tìm thấy thương hiệu", 404));
  }

  responseData(null, 200, "Xoá dữ liệu thành công", res);
});
