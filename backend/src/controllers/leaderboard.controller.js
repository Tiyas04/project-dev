import asyncHandler from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";
import { Follow } from "../models/follow.model.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const getGlobalLeaderboard = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
        .sort({ arenaScore: -1 })
        .skip(skip)
        .limit(limit)
        .select("name username avatar arenaScore");

    const total = await User.countDocuments();

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        }, "Global leaderboard fetched successfully")
    );
});

const getFriendsLeaderboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get the list of users this user is following
    const following = await Follow.find({ follower: userId }).select("following");
    const followingIds = following.map(f => f.following);
    
    // Add the user's own ID so they can see where they rank among friends
    followingIds.push(userId);

    const users = await User.find({ _id: { $in: followingIds } })
        .sort({ arenaScore: -1 })
        .select("name username avatar arenaScore");

    return res.status(200).json(
        new ApiResponse(200, { users }, "Friends leaderboard fetched successfully")
    );
});

export {
    getGlobalLeaderboard,
    getFriendsLeaderboard
};
