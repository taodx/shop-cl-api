const Chat = require("../models/chatModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");

exports.createChat = catchAsyncErrors(async (req, res, next) => {
  const { firstId, secondId } = req.body;

  try {
    const chat = await Chat.findOne({
      members: { $all: [firstId, secondId] },
    });

    if (chat) return responseData(chat, 200, "successfully", res);

    const newChat = new Chat({
      members: [firstId, secondId],
    });

    const response = await newChat.save();
    responseData(response, 200, "successfully", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

exports.findUserChats = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const chats = await Chat.find({
      members: { $in: [userId] },
    })
      .populate("members", "username email")
      .sort({ updatedAt: -1 }); // Sắp xếp theo updatedAt giảm dần

    responseData(chats, 200, "successfully", res);
  } catch (err) {
    console.error(err); // Log lỗi
    return next(new ErrorHander(err.message, 500));
  }
});

exports.findChat = catchAsyncErrors(async (req, res, next) => {
  const { firstId, secondId } = req.params;
  try {
    const chats = await Chat.find({
      members: { $all: [firstId, secondId] },
    });
    responseData(chats, 200, "successfully", res);
  } catch (err) {
    return next(new ErrorHander(err.message, 500));
  }
});
exports.markChatAsRead = catchAsyncErrors(async (req, res, next) => {
  const { chatId } = req.params;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { isRead: true },
      { new: true }
    );

    if (!updatedChat) {
      return next(new ErrorHander("Chat not found", 404));
    }

    responseData(updatedChat, 200, "Chat marked as read", res);
  } catch (err) {
    return next(new ErrorHander(err.message, 500));
  }
});
exports.getChatById = catchAsyncErrors(async (req, res, next) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId).populate(
      "members",
      "username email"
    );

    if (!chat) {
      return next(new ErrorHander("Chat not found", 404));
    }

    responseData(chat, 200, "Chat retrieved successfully", res);
  } catch (err) {
    return next(new ErrorHander(err.message, 500));
  }
});
