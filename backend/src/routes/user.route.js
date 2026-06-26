import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    getCurrentUser, 
    updateAccountDetails,
    updateUserAvatar,
    googleAuth,
    getPublicProfile,
    followUser,
    unfollowUser,
    searchUsers,
    getFollowersList,
    getFollowingList,
    getFriendsList
} from "../controllers/user.controller.js";
import { verifyJWT, optionalJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    registerUser
);
router.route("/login").post(loginUser);
router.route("/google-auth").post(googleAuth);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

// Public profile and social routes
router.route("/search").get(verifyJWT, searchUsers);
router.route("/profile/:username").get(optionalJWT, getPublicProfile);
router.route("/profile/:username/followers").get(optionalJWT, getFollowersList);
router.route("/profile/:username/following").get(optionalJWT, getFollowingList);
router.route("/profile/:username/friends").get(verifyJWT, getFriendsList);
router.route("/follow/:username").post(verifyJWT, followUser);
router.route("/unfollow/:username").post(verifyJWT, unfollowUser);

export default router;
