import { Request, Response } from "express";
import User from "../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const postRegister = async (req: Request, res: Response) => {
    try {
        console.log("register event came");

        const { name, email, password } = req.body;

        // check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log("user exists");
            console.log("email taken");
            return res.status(409).json({ msg: "E-mail already in use" });
        }

        // encrypt password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // create user document and save in database
        const user = await User.create({
            name,
            email,
            password: encryptedPassword,
        });

        console.log("created user");

        const payload = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };

        const secretKey = process.env.jwtSecret || "";

        console.log("env secret key is ", process.env.jwtSecret);
        console.log("secret key is ", secretKey);

        const expires = { expiresIn: "7d" };

        // create JWT token
        const token = jwt.sign(payload, secretKey, expires);
        console.log("Created token  = ", token);

        return res.status(201).json({ token, user });
    } catch (err) {
        console.log("Post Register ERROR", err);
        return res.status(500).json({ msg: "Error occured. Please try again" });
    }
};

export default postRegister;
