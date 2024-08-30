const Message = require("../models/messageModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");
const cloudinary = require("cloudinary");
const Chat = require("../models/chatModel");
//createMessage

// exports.createMessage = catchAsyncErrors(async (req, res, next) => {
//   const { chatId, senderId, text } = req.body;
//   const image = req.body.image;

//   if (!chatId || !senderId) {
//     return next(new ErrorHander("All fields are required", 400));
//   }

//   let messageData = {
//     chatId,
//     senderId,
//     text: text || "",
//   };

//   if (image) {
//     try {
//       const result = await cloudinary.uploader.upload(image, {
//         folder: "chat_images",
//       });

//       messageData.images = {
//         public_id: result.public_id,
//         url: result.secure_url,
//       };
//     } catch (err) {
//       return next(new ErrorHander("Failed to upload image", 500));
//     }
//   }

//   try {
//     const message = new Message(messageData);
//     const savedMessage = await message.save();

//     // Cập nhật `updatedAt` của chat
//     const updatedChat = await Chat.findByIdAndUpdate(
//       chatId,
//       { updatedAt: new Date() },
//       { new: true }
//     );

//     responseData(savedMessage, 200, "Message sent successfully", res);
//   } catch (err) {
//     return next(new ErrorHander(err.message, 500));
//   }
// });

exports.createMessage = catchAsyncErrors(async (req, res, next) => {
  const { chatId, senderId, text } = req.body;
  const image = req.body.image;

  if (!chatId || !senderId) {
    return next(new ErrorHander("All fields are required", 400));
  }

  let messageData = {
    chatId,
    senderId,
    text: text || "",
  };

  if (image) {
    try {
      const result = await cloudinary.uploader.upload(image, {
        folder: "chat_images",
      });

      messageData.images = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    } catch (err) {
      return next(new ErrorHander("Failed to upload image", 500));
    }
  }

  try {
    const message = new Message(messageData);
    const savedMessage = await message.save();

    // Cập nhật `updatedAt` của chat và đặt `isRead` thành `false`
    await Chat.findByIdAndUpdate(
      chatId,
      { updatedAt: new Date(), isRead: false },
      { new: true }
    );

    responseData(savedMessage, 200, "Message sent successfully", res);
  } catch (err) {
    return next(new ErrorHander(err.message, 500));
  }
});

//getMessage
exports.getMessage = catchAsyncErrors(async (req, res, next) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chatId });
    responseData(messages, 200, "successfully", res);
  } catch (err) {
    return next(new ErrorHander(err.message, 500));
  }
});
