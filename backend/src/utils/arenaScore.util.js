import { User } from "../models/user.model.js";
import { ConnectedAccount } from "../models/connectedAccount.model.js";

/**
 * Calculates the unified Arena Score for a user based on their connected platforms.
 * Formula: (Codeforces Rating * 1.5) + (LeetCode Rating * 1.2) + (Total Solved * 2)
 */
export const updateArenaScore = async (userId) => {
    try {
        const account = await ConnectedAccount.findOne({ user: userId });
        if (!account) return 0;

        let cfRating = 0;
        let lcRating = 0;
        let totalSolved = 0;

        // Codeforces Stats
        if (account.codeforces?.username && account.codeforces?.stats) {
            cfRating = account.codeforces.stats.currentRating || 0;
            totalSolved += account.codeforces.stats.problemsSolved || 0;
        }

        // LeetCode Stats
        if (account.leetcode?.username && account.leetcode?.stats) {
            lcRating = account.leetcode.stats.currentRating || 0;
            totalSolved += account.leetcode.stats.problemsSolved || 0;
        }

        const arenaScore = Math.floor((cfRating * 1.5) + (lcRating * 1.2) + (totalSolved * 2));

        const user = await User.findById(userId);
        if (user && arenaScore > (user.arenaScore || 0) + 20) {
             const { Activity } = await import("../models/activity.model.js");
             await Activity.create({
                 user: userId,
                 type: 'SCORE_INCREASED',
                 platform: 'devarena',
                 metadata: { 
                     oldScore: user.arenaScore || 0,
                     newScore: arenaScore 
                 }
             });
        }

        await User.findByIdAndUpdate(userId, { arenaScore });

        return arenaScore;
    } catch (error) {
        console.error("Error updating Arena Score:", error);
        return 0;
    }
};
