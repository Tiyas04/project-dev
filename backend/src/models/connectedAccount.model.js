import mongoose from "mongoose";

const connectedAccountSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        leetcode: {
            username: {
                type: String,
                trim: true,
                default: "",
            },
            stats: {
                type: mongoose.Schema.Types.Mixed,
                default: {},
            },
            lastSyncedAt: {
                type: Date,
            },
        },
        codeforces: {
            username: {
                type: String,
                trim: true,
                default: "",
            },
            stats: {
                type: mongoose.Schema.Types.Mixed,
                default: {},
            },
            lastSyncedAt: {
                type: Date,
            },
        },
        github: {
            username: {
                type: String,
                trim: true,
                default: "",
            },
            stats: {
                type: mongoose.Schema.Types.Mixed,
                default: {},
            },
            lastSyncedAt: {
                type: Date,
            },
        },
    },
    {
        timestamps: true,
    }
);

export const ConnectedAccount = mongoose.model("ConnectedAccount", connectedAccountSchema);
