import { Request, Response } from "express";
import Chat from "../../models/Chat";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

interface DecodedToken {
    user: {
        id: string;
        email: string;
    };
    iat: number;
    exp: number;
}

interface Choice {
    message: Message;
    finish_reason: string;
    index: number;
}

interface OpenAIResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Choice[];
}

interface Message {
    role: string;
    content: string;
}

const getChatsCount = async (req: Request, res: Response) => {
    const token = req.headers["x-auth-token"] as string;

    if (!token) {
        console.error("no token");
        return res.status(401).json({ msg: "No Token. Authorization Denied." });
    }
    try {
        const decoded = jwt.verify(
            token,
            process.env.jwtSecret || ""
        ) as DecodedToken;
        const user = decoded.user.id;

        try {
            const chats = await Chat.find({ user });
            if (chats.length === 0) {
                const msgs = chats[0];
                return res.json({ msgs });
            } else {
                const msgs = chats[0].messages;
                const count = msgs.length;
                return res.json({ count });
            }
        } catch (error) {
            console.error(error);
            return res.status(400).json({ msg: error });
        }
    } catch (error) {
        return res.status(401).json({ msg: "Token is not valid" });
    }
};

export default getChatsCount;
