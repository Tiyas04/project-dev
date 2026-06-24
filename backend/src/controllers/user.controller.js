import asyncHandler from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { OAuth2Client } from "google-auth-library";
import { enrichUser } from "../utils/userEnricher.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.log("Error :", error)
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    const { name, email, username, password } = req.body;

    // validation - not empty
    if ([name, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarBuffer = req.files?.avatar?.[0]?.buffer;

    let avatarUrl = "https://cdn-icons-png.flaticon.com/512/5951/5951752.png";
    if (avatarBuffer) {
        const avatar = await uploadOnCloudinary(avatarBuffer);
        if (avatar && avatar.url) {
            avatarUrl = avatar.url;
        }
    }

    // create user object - create entry in db
    const user = await User.create({
        name,
        avatar: avatarUrl,
        email,
        password,
        username: username.toLowerCase()
    })

    const dbUser = await User.findById(user._id);
    if (!dbUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }
    const createdUser = await enrichUser(dbUser);

    console.log("user created successfully")
    // return res
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "username or email is required");
    }

    // find the user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // password check
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const dbUser = await User.findById(user._id);
    const loggedInUser = await enrichUser(dbUser);

    // send cookie
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    }

    console.log("user logged in successfully")
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully"
            )
        )
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    }

    console.log("user logged out successfully")
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        console.log("error :",error)
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        }
        return res
            .status(401)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(401, {}, error?.message || "Invalid refresh token"));
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    console.log("user fetched successfully")
    const enrichedUser = await enrichUser(req.user);
    return res
        .status(200)
        .json(new ApiResponse(200, enrichedUser, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, email, username } = req.body;

    if (!name || !email || !username) {
        throw new ApiError(400, "All fields are required");
    }

    // If username is being changed, check if new username is unique
    if (username.toLowerCase() !== req.user.username.toLowerCase()) {
        const existedUser = await User.findOne({ username: username.toLowerCase() });
        if (existedUser) {
            throw new ApiError(409, "Username is already taken");
        }
    }

    // If email is being changed, check if new email is unique
    if (email.toLowerCase() !== req.user.email.toLowerCase()) {
        const existedUser = await User.findOne({ email: email.toLowerCase() });
        if (existedUser) {
            throw new ApiError(409, "Email is already registered");
        }
    }

    const dbUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                name,
                email: email.toLowerCase(),
                username: username.toLowerCase()
            }
        },
        { new: true, runValidators: true }
    );
    const enrichedUser = await enrichUser(dbUser);

    console.log("user updated successfully")
    return res
        .status(200)
        .json(new ApiResponse(200, enrichedUser, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarBuffer = req.file?.buffer;
    let avatarUrl = "https://cdn-icons-png.flaticon.com/512/5951/5951752.png";

    if (avatarBuffer) {
        const avatar = await uploadOnCloudinary(avatarBuffer);
        
        if (!avatar || !avatar.url) {
            throw new ApiError(400, "Error while uploading avatar on cloudinary");
        }
        avatarUrl = avatar.url;
    }

    const dbUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatarUrl
            }
        },
        { new: true }
    );
    const enrichedUser = await enrichUser(dbUser);

    const message = avatarBuffer 
        ? "Avatar image updated successfully" 
        : "Avatar removed, default avatar applied";

        console.log("Avatar updated successfully")
    return res
        .status(200)
        .json(new ApiResponse(200, enrichedUser, message));
});

const googleAuth = asyncHandler(async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        throw new ApiError(400, "Google credential is required");
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Derive username from email (e.g. john.doe@gmail.com -> john.doe)
            let baseUsername = email.split('@')[0].toLowerCase();
            let username = baseUsername;
            let counter = 1;

            // Ensure username uniqueness
            while (await User.findOne({ username })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            user = await User.create({
                name,
                email,
                username,
                avatar: picture || "https://cdn-icons-png.flaticon.com/512/5951/5951752.png",
                authProvider: "google",
                googleId
            });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const dbUser = await User.findById(user._id);
        const loggedInUser = await enrichUser(dbUser);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        };

        console.log("User account created/loggedin successfully")
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { user: loggedInUser, accessToken, refreshToken },
                    "Google login successful"
                )
            );
    } catch (error) {
        console.error("Google Auth Error:", error);
        throw new ApiError(401, "Invalid Google Token");
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    googleAuth
}
