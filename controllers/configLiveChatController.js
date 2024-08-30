const ConfigLiveChat = require("../models/configLivechatModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");
const responseData = require("../utils/responseData");

exports.getDetailConfigLiveChat = catchAsyncErrors(async (req, res, next) => {
  const configLiveChat = await ConfigLiveChat.findById(req.params.id).populate('user');

  if (!configLiveChat) {
    return next(new ErrorHander("ConfigLiveChat not found", 404));
  }

  responseData(configLiveChat, 200, "Lấy thông tin ConfigLiveChat thành công", res);
});
// Cập nhật ConfigLiveChat
exports.updateConfigLiveChat = catchAsyncErrors(async (req, res, next) => {
  let configLiveChat = await ConfigLiveChat.findById(req.params.id);

  if (!configLiveChat) {
    return next(new ErrorHander("ConfigLiveChat not found", 404));
  }

  configLiveChat = await ConfigLiveChat.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  responseData(configLiveChat, 200, "Cập nhật ConfigLiveChat thành công", res);
});

exports.createConfigLiveChat = catchAsyncErrors(async (req, res, next) => {
  const user = req.user.id;
  const { keyLive } = req.body;

  const newConfigLiveChat = await ConfigLiveChat.create({
    keyLive,
    user,
  });

  responseData(newConfigLiveChat, 201, "Tạo ConfigLiveChat thành công", res);
});