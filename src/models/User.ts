import mongoose, { Document, Model, Schema } from "mongoose";

// Define the User interface for TypeScript type checking
interface IUser extends Document {
    name: string;
    email: string;
    password: string;
}

// Define the User schema
const userSchema: Schema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Define the User model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
