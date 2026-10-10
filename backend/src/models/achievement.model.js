import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        badgeId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        platform: {
            type: String,
            enum: ["leetcode", "codeforces", "github", "devarena"],
            required: true,
        },
        category: {
            type: String,
            enum: ["streak", "solved", "rank", "contest", "social", "special"],
            default: "special",
        },
        icon: {
            type: String,
            default: "trophy",
        },
        tier: {
            type: String,
            enum: ["bronze", "silver", "gold", "platinum", "diamond"],
            default: "bronze",
        },
        unlockedAt: {
            type: Date,
            default: Date.now,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index ensuring each user can only unlock each badge once
achievementSchema.index({ user: 1, badgeId: 1 }, { unique: true });

export const Achievement = mongoose.model("Achievement", achievementSchema);
