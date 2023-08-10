import express from "express";
import mongoose from "mongoose";

import cors from "cors";

import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/authRoutes";
import apiRoutes from "./routes/apiRoutes";

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
