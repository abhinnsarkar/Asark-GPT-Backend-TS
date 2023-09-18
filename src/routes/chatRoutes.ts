import express from "express";
import chatControllers from "../controllers/chat/chatControllers";

const router = express.Router();

router.get("/", chatControllers.getChats);
router.get("/count", chatControllers.getChatsCount);
router.post("/", chatControllers.postChat);

export default router;
