import express from "express";
import mongoose from "mongoose";

import cors from "cors";

import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/authRoutes";
import apiRoutes from "./routes/apiRoutes";

// for chats
import Chat from "./models/Chat";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
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

// Define and use routes here
app.use(express.json());
app.use(cors());
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

app.post("/api/prompts", async (req, res) => {
    console.log("inside post for prompts");

    console.log("headersss ", req.headers);

    const token = req.headers["x-auth-token"] as string;

    const promptValue = req.body.promptValue;

    if (!token) {
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
            const data = await response.json();
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
                console.log("chats already exist");
                console.log("pushing new message");
                chats.messages.push(message);
                await chats.save();
            } else {
                console.log("creating new chat");
                console.log("message :", message);
                const newChat = new Chat({
                    user,
                    messages: [message],
                });
                await newChat.save();
                console.log("saved new chat and msg");
            }

            return res.json({ aiResponse });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ msg: error });
        }
    } catch (error) {
        console.error("errorrrrrrrr", error);
        return res.status(401).json({ msg: "Token is not valid" });
    }
});

app.get("/api/prompts", async (req, res) => {
    console.log("at the server level getting messages");
    const token = req.headers["x-auth-token"] as string;

    if (!token) {
        console.log("no token in get prompts messages");
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
            console.log("chats retrieved are ", chats);
            if (chats.length === 0) {
                const msgs = chats[0];
                return res.json({ msgs });
            } else {
                const msgs = chats[0].messages;
                return res.json({ msgs });
            }
        } catch (error) {
            console.error(error);
            return res.status(400).json({ msg: "error" });
        }
    } catch (error) {
        return res.status(401).json({ msg: "Token is not valid" });
    }
});
app.get("/api/prompts/count", async (req, res) => {
    console.log("at the server level getting messages");
    const token = req.headers["x-auth-token"] as string;

    if (!token) {
        console.log("no token in get prompts messages");
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
            console.log("chats retrieved are ", chats);
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
            return res.status(400).json({ msg: "error" });
        }
    } catch (error) {
        return res.status(401).json({ msg: "Token is not valid" });
    }
});
