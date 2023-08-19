import mongoose, { Document, Model, Schema } from "mongoose";

// Define the User interface for TypeScript type checking
interface IChat extends Document {
    user: {
        type: Schema.Types.ObjectId;
        ref: "chat";
    };
    messages: [{ user: String; ai: String }];
}

// Define the User schema
const chatSchema: Schema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "chat",
    },
    messages: [{ user: String, ai: String }],
});

// Define the User model
const User: Model<IChat> = mongoose.model<IChat>("Chat", chatSchema);

export default User;
