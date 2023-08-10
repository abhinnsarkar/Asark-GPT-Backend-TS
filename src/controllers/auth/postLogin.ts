import { Request, Response } from "express";
import User from "../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const postLogin = async (req: Request, res: Response) => {
    try {
        console.log("login event came");
        const { email, password } = req.body;

        // check if user exists
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            console.log("proper credentials");

            // send new token
            const payload = {
                user: {
                    id: user.id,
                    email: user.email,
                },
            };
            // const secretKey = config.get("jwtSecret");
            const secretKey = process.env.jwtSecret || "";
            const expires = { expiresIn: "7d" };

            const token = jwt.sign(payload, secretKey, expires);
            console.log("Created token  = ", token);

            return res.status(200).json({ token, user });
        }

        return res
            .status(400)
            .json({ msg: "Invalid credentials. Please try again" });
    } catch (err) {
        return res
            .status(500)
            .json({ msg: "Something went wrong. Please try again" });
    }
};

export default postLogin;
