import express from "express";
import apiControllers from "../controllers/api/apiControllers";

const router = express.Router();

router.get("/", apiControllers.getRoot);

export default router;
