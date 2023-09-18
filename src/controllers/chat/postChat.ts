import { Request, Response } from "express";
import fetch from "node-fetch-commonjs";
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

const postChat = async (req: Request, res: Response) => {
    const token = req.headers["x-auth-token"] as string;
    const promptValue = req.body.promptValue;
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
        const options = {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: promptValue }],
                max_tokens: 100,
            }),
        };
        try {
            const response = await fetch(
                "https://api.openai.com/v1/chat/completions",
                options
            );
            const data = (await response.json()) as OpenAIResponse;
            console.log(data);
            const aiResponse = data.choices[0].message.content;
            const message = {
                user: promptValue,
                ai: aiResponse,
            };
            var chats;
            chats = await Chat.findOne({
                user,
            });
            if (chats) {
                chats.messages.push(message);
                await chats.save();
            } else {
                const newChat = new Chat({
                    user,
                    messages: [message],
                });
                await newChat.save();
            }
            return res.json({ aiResponse });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ msg: error });
        }
    } catch (error) {
        console.error(error);
        return res.status(401).json({ msg: "Token is not valid" });
    }
};

export default postChat;
