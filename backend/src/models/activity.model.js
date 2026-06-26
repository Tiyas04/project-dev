import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ['ACCOUNT_LINKED', 'MILESTONE_REACHED', 'SCORE_INCREASED', 'RANK_UP'],
            required: true,
        },
        platform: {
            type: String,
            enum: ['leetcode', 'codeforces', 'github', 'devarena'],
            required: true,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        }
    },
    {
        timestamps: true,
    }
);

export const Activity = mongoose.model("Activity", activitySchema);
