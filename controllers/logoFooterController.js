const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary");
const LogoFooter = require("../models/logoFooterModel");
const ErrorHander = require("../utils/errorhander");
const responseData = require("../utils/responseData");

exports.createLogoFooter = catchAsyncErrors(async (req, res, next) => {
  try {
    const image = req.body.image;
    if (!image) {
      return next(new ErrorHander("Không có hình ảnh", 400));
    }

    const result = await cloudinary.v2.uploader.upload(image, {
      folder: "logoFooter",
    });

    req.body.images = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    const logo = await LogoFooter.create(req.body);

    responseData(logo, 200, "Thêm logo thành công", res);
  } catch (error) {
    console.error("Error creating logo header:", error);
    responseData(null, 500, "Lỗi khi tạo logo header", res);
  }
});
exports.updateLogoFooter = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let logo = await LogoFooter.findById(id);

  if (!logo) {
    return next(new ErrorHander("Không tìm thấy logo", 404));
  }

  // Xóa hình ảnh cũ khỏi Cloudinary
  const oldImageId = logo.images.public_id;
  await cloudinary.v2.uploader.destroy(oldImageId);

  // Tải hình ảnh mới lên Cloudinary
  const newImage = req.body.image; // Chỉ chấp nhận một hình ảnh mới
  const result = await cloudinary.v2.uploader.upload(newImage, {
    folder: "logoHeader",
  });

  // Cập nhật đối tượng hình ảnh
  logo.images = {
    public_id: result.public_id,
    url: result.secure_url,
  };

  await logo.save();

  responseData(logo, 200, "Cập nhật logo thành công", res);
});

exports.getLogoFooterDetail = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const logo = await LogoFooter.findById(id);

  if (!logo) {
    return next(new ErrorHander("Không tìm thấy logo", 404));
  }

  responseData(logo, 200, "Lấy chi tiết logo thành công", res);
});
