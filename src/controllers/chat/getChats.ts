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

const getChats = async (req: Request, res: Response) => {
    console.log("Retrieving chats in backend");

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
            const usersChats = await Chat.find({ user });
            if (usersChats.length === 0) {
                const msgs = usersChats[0];
                return res.json({ msgs });
            } else {
                const chats = usersChats[0].messages;
                console.log("backend said msgs are ", chats);
                return res.json({ chats });
            }
        } catch (error) {
            console.error(error);
            return res.status(400).json({ msg: error });
        }
    } catch (error) {
        return res.status(401).json({ msg: "Token is not valid" });
    }
};

export default getChats;
