const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");
const {
  createMessage,
  getMessage,
} = require("../controllers/messageController");

const router = express.Router();

router.route("/chat/createMessage").post(isAuthenticatedUser, createMessage);

router.route("/chat/:chatId").get(isAuthenticatedUser, getMessage);
module.exports = router;
