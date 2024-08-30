const express = require("express");

const {
  createChat,
  findUserChats,
  findChat,
  markChatAsRead,
  getChatById,
  //   getUserChats,
  //   findUserInChat,
  //   addMessageToChat,
  //   uploadImage,
} = require("../controllers/chatController");
const { isAuthenticatedUser } = require("../middleware/auth");

const router = express.Router();

router.route("/chat/create").post(isAuthenticatedUser, createChat);

router.route("/chat/user/:userId").get(isAuthenticatedUser, findUserChats);
router.route("/chat/detail/:chatId").get(isAuthenticatedUser, getChatById);
router
  .route("/chat/find/:firstId/:secondId")
  .get(isAuthenticatedUser, findChat);

router.route("/chat/read/:chatId").put(isAuthenticatedUser, markChatAsRead);

// router.route("/chat/user/:userId").get(isAuthenticatedUser, getUserChats);

// router.route("/chat/search").get(isAuthenticatedUser, findUserInChat);

// router.route("/chat/message").post(isAuthenticatedUser, uploadImage, addMessageToChat);

module.exports = router;
