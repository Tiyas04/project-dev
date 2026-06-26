import asyncHandler from "../utils/AsyncHandler.js";
import { Activity } from "../models/activity.model.js";
import { Follow } from "../models/follow.model.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const getFriendActivityFeed = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get the list of users this user is following
    const following = await Follow.find({ follower: userId }).select("following");
    const followingIds = following.map(f => f.following);

    // If not following anyone, return empty array early
    if (followingIds.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "Friend activity feed fetched successfully")
        );
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const activities = await Activity.find({ user: { $in: followingIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name username avatar");

    return res.status(200).json(
        new ApiResponse(200, activities, "Friend activity feed fetched successfully")
    );
});

export {
    getFriendActivityFeed
};
