import express from "express";
import fetch from "node-fetch-commonjs";
import mongoose from "mongoose";

import cors from "cors";

import * as dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/authRoutes";
import apiRoutes from "./routes/apiRoutes";

import Chat from "./models/Chat";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.DB || "", {})
    .then(() => {
        console.log("Connected to MongoDB");
        console.log("db string is ", process.env.DB);
        // Start the Express server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });

app.use(express.json());
const allowedOrigins = [
    "https://asark-gpt.onrender.com",
    "http://localhost:3000/",
];

const corsOptions = {
    origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
    ) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
};

// app.use(cors(corsOptions));
app.use(cors);

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

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

app.post("/api/chats", async (req, res) => {
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
});

app.get("/api/chats", async (req, res) => {
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
});

app.get("/api/chats/previous-count", async (req, res) => {
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
});
