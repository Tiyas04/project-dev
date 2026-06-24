import { ConnectedAccount } from "../models/connectedAccount.model.js";

/**
 * Enriches a user object with their connected platform usernames and stats
 * @param {object} user Mongoose user document or object
 * @returns {Promise<object>} Plain user object with leetcode, codeforces, github, and stats fields
 */
export async function enrichUser(user) {
    if (!user) return null;
    
    // Convert to plain object if it is a Mongoose document
    const userObj = typeof user.toObject === "function" ? user.toObject() : { ...user };
    
    // Ensure sensitive fields are removed
    delete userObj.password;
    delete userObj.refreshToken;

    const connectedAccount = await ConnectedAccount.findOne({ user: userObj._id });
    
    if (connectedAccount) {
        userObj.leetcode = connectedAccount.leetcode?.username || "";
        userObj.codeforces = connectedAccount.codeforces?.username || "";
        userObj.github = connectedAccount.github?.username || "";
        userObj.stats = {
            leetcode: connectedAccount.leetcode?.username ? connectedAccount.leetcode.stats : null,
            codeforces: connectedAccount.codeforces?.username ? connectedAccount.codeforces.stats : null,
            github: connectedAccount.github?.username ? connectedAccount.github.stats : null,
        };
    } else {
        userObj.leetcode = "";
        userObj.codeforces = "";
        userObj.github = "";
        userObj.stats = {
            leetcode: null,
            codeforces: null,
            github: null,
        };
    }
    
    return userObj;
}
