import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "model"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    { _id: false, timestamps: true }
);

const aiChatSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        messages: [messageSchema],
    },
    {
        timestamps: true,
    }
);

export const AiChat = mongoose.model("AiChat", aiChatSchema);
