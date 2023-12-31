import express from "express";
import { createValidator } from "express-joi-validation";
import Joi from "joi";
import authControllers from "../controllers/auth/authControllers";

const router = express.Router();
const validator = createValidator({});

const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
});
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
});

router.post(
    "/register",
    validator.body(registerSchema),
    authControllers.postRegister
);
router.post("/login", validator.body(loginSchema), authControllers.postLogin);
router.post("/delete", authControllers.deleteAccount);

export default router;
