const ConfigWebsite = require("../models/configWebsiteModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");

// Create a new config
exports.createConfig = catchAsyncErrors(async (req, res, next) => {
  try {
    const { nameWebsite, baoTri, minRut, maxRut } = req.body;

    const config = await ConfigWebsite.create({
      nameWebsite,
      baoTri,
      minRut,
      maxRut,
    });

    responseData(config, 200, "Tạo cấu hình website mới thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

// Get config details
exports.getConfigDetails = catchAsyncErrors(async (req, res, next) => {
  try {
    const config = await ConfigWebsite.findById(req.params.id);

    if (!config) {
      return next(new ErrorHander("Không tìm thấy cấu hình", 404));
    }

    responseData(config, 200, "Lấy chi tiết cấu hình website thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

// Update config
exports.updateConfig = catchAsyncErrors(async (req, res, next) => {
  try {
    const { nameWebsite, baoTri, minRut, maxRut } = req.body;

    let config = await ConfigWebsite.findById(req.params.id);

    if (!config) {
      return next(new ErrorHander("Không tìm thấy cấu hình", 404));
    }

    config.nameWebsite = nameWebsite || config.nameWebsite;
    config.baoTri = baoTri !== undefined ? baoTri : config.baoTri;
    config.minRut = minRut || config.minRut;
    config.maxRut = maxRut || config.maxRut;

    await config.save();

    responseData(config, 200, "Cập nhật cấu hình website thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});
