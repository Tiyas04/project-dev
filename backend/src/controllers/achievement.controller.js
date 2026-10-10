import asyncHandler from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
    checkAndAwardAchievements,
    getUserAchievements,
} from "../services/achievement.service.js";
import { Achievement } from "../models/achievement.model.js";

/**
 * Returns all achievements (unlocked & locked) for the currently authenticated user.
 */
export const getMyAchievements = asyncHandler(async (req, res) => {
    const data = await getUserAchievements(req.user._id);
    return res.status(200).json(
        new ApiResponse(200, data, "Achievements fetched successfully")
    );
});

/**
 * Returns public unlocked achievements for a specific username.
 */
export const getUserPublicAchievements = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const unlocked = await Achievement.find({ user: user._id })
        .sort({ unlockedAt: -1 })
        .select("badgeId title description platform category icon tier unlockedAt");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                username: user.username,
                unlockedCount: unlocked.length,
                achievements: unlocked,
            },
            "Public achievements fetched successfully"
        )
    );
});

/**
 * Evaluates achievements on-demand and awards any newly earned badges.
 */
export const checkMyAchievements = asyncHandler(async (req, res) => {
    const newlyAwarded = await checkAndAwardAchievements(req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                newlyAwardedCount: newlyAwarded.length,
                newlyAwarded,
            },
            newlyAwarded.length > 0
                ? `Congratulations! You unlocked ${newlyAwarded.length} new achievement(s)!`
                : "All eligible achievements are already unlocked. Keep coding!"
        )
    );
});
