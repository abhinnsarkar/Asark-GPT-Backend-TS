import { Request, Response } from "express";
import User from "../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Chat from "../../models/Chat";
dotenv.config();

interface DecodedToken {
    user: {
        id: string;
        email: string;
    };
    iat: number;
    exp: number;
}

const deleteAccount = async (req: Request, res: Response) => {
    try {
        console.log("delete event came");
        const token = req.headers["x-auth-token"] as string;

        if (!token) {
            console.log("no token");
            return res
                .status(401)
                .json({ msg: "No Token. Authorization Denied." });
        }

        const decoded = jwt.verify(
            token,
            process.env.jwtSecret || ""
        ) as DecodedToken;
        const userId = decoded.user.id;
        console.log("user is ", userId);

        await Chat.findOneAndDelete({ user: userId });
        await User.findByIdAndDelete(userId);

        console.log("Account Has Been Deleted");
        return res.status(200).json({ msg: "Account Has Been Deleted" });
    } catch (err) {
        console.log("Something went wrong. Please try again");
        return res
            .status(500)
            .json({ msg: "Something went wrong. Please try again" });
    }
};

export default deleteAccount;
