import { Achievement } from "../models/achievement.model.js";
import { ConnectedAccount } from "../models/connectedAccount.model.js";
import { User } from "../models/user.model.js";
import { Activity } from "../models/activity.model.js";
import { Follow } from "../models/follow.model.js";
import { cacheService } from "./cache.service.js";

/**
 * Full catalogue of system achievements and evaluation criteria
 */
export const ACHIEVEMENT_CATALOGUE = [
    // --- LeetCode Achievements ---
    {
        badgeId: "lc_first_blood",
        title: "First Blood",
        description: "Solve your first problem on LeetCode",
        platform: "leetcode",
        category: "solved",
        icon: "sword",
        tier: "bronze",
        check: (stats) => (stats?.leetcode?.problemsSolved || 0) > 0,
    },
    {
        badgeId: "lc_consistency_30",
        title: "Consistency",
        description: "Maintain a 30+ day streak on LeetCode",
        platform: "leetcode",
        category: "streak",
        icon: "flame",
        tier: "silver",
        check: (stats) => (stats?.leetcode?.maxStreak || 0) >= 30,
    },
    {
        badgeId: "lc_centurion_100",
        title: "Centurion",
        description: "Solve 100+ problems on LeetCode",
        platform: "leetcode",
        category: "solved",
        icon: "target",
        tier: "silver",
        check: (stats) => (stats?.leetcode?.problemsSolved || 0) >= 100,
    },
    {
        badgeId: "lc_elite_300",
        title: "Elite Solver",
        description: "Solve 300+ problems on LeetCode",
        platform: "leetcode",
        category: "solved",
        icon: "award",
        tier: "gold",
        check: (stats) => (stats?.leetcode?.problemsSolved || 0) >= 30,
    },
    {
        badgeId: "lc_grandmaster_500",
        title: "Grandmaster Solver",
        description: "Solve 500+ problems on LeetCode",
        platform: "leetcode",
        category: "solved",
        icon: "crown",
        tier: "platinum",
        check: (stats) => (stats?.leetcode?.problemsSolved || 0) >= 500,
    },
    {
        badgeId: "lc_weekend_warrior",
        title: "Weekend Warrior",
        description: "Attend your first LeetCode contest",
        platform: "leetcode",
        category: "contest",
        icon: "trophy",
        tier: "bronze",
        check: (stats) => (stats?.leetcode?.contests || 0) > 0,
    },
    {
        badgeId: "lc_knight",
        title: "Knight",
        description: "Achieve a LeetCode contest rating of 1800+",
        platform: "leetcode",
        category: "rank",
        icon: "shield",
        tier: "gold",
        check: (stats) => (stats?.leetcode?.currentRating || 0) >= 1800,
    },
    {
        badgeId: "lc_guardian",
        title: "Guardian",
        description: "Achieve a LeetCode contest rating of 2150+",
        platform: "leetcode",
        category: "rank",
        icon: "zap",
        tier: "platinum",
        check: (stats) => (stats?.leetcode?.currentRating || 0) >= 2150,
    },

    // --- Codeforces Achievements ---
    {
        badgeId: "cf_first_solve",
        title: "First CF Solved",
        description: "Solve your first problem on Codeforces",
        platform: "codeforces",
        category: "solved",
        icon: "sword",
        tier: "bronze",
        check: (stats) => (stats?.codeforces?.problemsSolved || 0) > 0,
    },
    {
        badgeId: "cf_contender",
        title: "CF Contender",
        description: "Participate in your first Codeforces contest",
        platform: "codeforces",
        category: "contest",
        icon: "trophy",
        tier: "bronze",
        check: (stats) => (stats?.codeforces?.contests || 0) > 0,
    },
    {
        badgeId: "cf_pupil",
        title: "Pupil Rank",
        description: "Reach Pupil rank on Codeforces (1200+ rating)",
        platform: "codeforces",
        category: "rank",
        icon: "user-check",
        tier: "bronze",
        check: (stats) => (stats?.codeforces?.currentRating || 0) >= 1200,
    },
    {
        badgeId: "cf_specialist",
        title: "Specialist Rank",
        description: "Reach Specialist rank on Codeforces (1400+ rating)",
        platform: "codeforces",
        category: "rank",
        icon: "shield",
        tier: "silver",
        check: (stats) => (stats?.codeforces?.currentRating || 0) >= 1400,
    },
    {
        badgeId: "cf_expert",
        title: "Expert Rank",
        description: "Reach Expert rank on Codeforces (1600+ rating)",
        platform: "codeforces",
        category: "rank",
        icon: "star",
        tier: "gold",
        check: (stats) => (stats?.codeforces?.currentRating || 0) >= 1600,
    },
    {
        badgeId: "cf_candidate_master",
        title: "Candidate Master",
        description: "Reach Candidate Master rank on Codeforces (1900+ rating)",
        platform: "codeforces",
        category: "rank",
        icon: "zap",
        tier: "platinum",
        check: (stats) => (stats?.codeforces?.currentRating || 0) >= 1900,
    },

    // --- GitHub Achievements ---
    {
        badgeId: "gh_first_repo",
        title: "First Repo",
        description: "Create a public repository on GitHub",
        platform: "github",
        category: "solved",
        icon: "folder-git",
        tier: "bronze",
        check: (stats) => (stats?.github?.publicRepos || 0) > 0,
    },
    {
        badgeId: "gh_active_contributor",
        title: "Active Contributor",
        description: "Reach 100+ contributions on GitHub this year",
        platform: "github",
        category: "streak",
        icon: "git-commit",
        tier: "silver",
        check: (stats) => (stats?.github?.contributions || 0) >= 100,
    },
    {
        badgeId: "gh_pr_champion",
        title: "PR Champion",
        description: "Open 10+ pull requests on GitHub",
        platform: "github",
        category: "special",
        icon: "git-pull-request",
        tier: "gold",
        check: (stats) => (stats?.github?.pullRequests || 0) >= 10,
    },
    {
        badgeId: "gh_star_catcher",
        title: "Star Catcher",
        description: "Receive 5+ stars on your GitHub repositories",
        platform: "github",
        category: "special",
        icon: "star",
        tier: "gold",
        check: (stats) => (stats?.github?.starsReceived || 0) >= 5,
    },

    // --- DevArena Unified Achievements ---
    {
        badgeId: "arena_initiate",
        title: "Multi-Platform Pioneer",
        description: "Connect at least two competitive platforms to DevArena",
        platform: "devarena",
        category: "social",
        icon: "layers",
        tier: "bronze",
        check: (stats) => {
            let count = 0;
            if (stats?.leetcode?.username) count++;
            if (stats?.codeforces?.username) count++;
            if (stats?.github?.username) count++;
            return count >= 2;
        },
    },
    {
        badgeId: "arena_gladiator",
        title: "Rising Gladiator",
        description: "Surpass 1,000 Arena Score",
        platform: "devarena",
        category: "rank",
        icon: "target",
        tier: "silver",
        check: (_, user) => (user?.arenaScore || 0) >= 1000,
    },
    {
        badgeId: "arena_titan",
        title: "Arena Champion",
        description: "Surpass 2,000 Arena Score",
        platform: "devarena",
        category: "rank",
        icon: "crown",
        tier: "platinum",
        check: (_, user) => (user?.arenaScore || 0) >= 2000,
    },
    {
        badgeId: "arena_socialite",
        title: "Arena Socialite",
        description: "Gain your first follower or friend on DevArena",
        platform: "devarena",
        category: "social",
        icon: "users",
        tier: "bronze",
        check: (_, __, social) => (social?.followersCount || 0) > 0,
    },
];

/**
 * Checks all achievement rules for a user and awards any that are newly unlocked.
 * @param {string|ObjectId} userId
 * @returns {Promise<Array>} List of newly unlocked achievements
 */
export async function checkAndAwardAchievements(userId) {
    try {
        const user = await User.findById(userId);
        if (!user) return [];

        const account = await ConnectedAccount.findOne({ user: userId });
        const followersCount = await Follow.countDocuments({ following: userId });

        const statsContext = {
            leetcode: account?.leetcode?.stats ? { ...account.leetcode.stats, username: account.leetcode.username } : null,
            codeforces: account?.codeforces?.stats ? { ...account.codeforces.stats, username: account.codeforces.username } : null,
            github: account?.github?.stats ? { ...account.github.stats, username: account.github.username } : null,
        };

        const socialContext = {
            followersCount,
        };

        // Fetch already awarded badge IDs for this user
        const existingAchievements = await Achievement.find({ user: userId }).select("badgeId");
        const existingBadgeIds = new Set(existingAchievements.map((a) => a.badgeId));

        const newlyUnlocked = [];

        for (const rule of ACHIEVEMENT_CATALOGUE) {
            if (existingBadgeIds.has(rule.badgeId)) {
                continue;
            }

            const isEligible = rule.check(statsContext, user, socialContext);

            if (isEligible) {
                try {
                    const achievement = await Achievement.create({
                        user: userId,
                        badgeId: rule.badgeId,
                        title: rule.title,
                        description: rule.description,
                        platform: rule.platform,
                        category: rule.category,
                        icon: rule.icon,
                        tier: rule.tier,
                        unlockedAt: new Date(),
                    });

                    newlyUnlocked.push(achievement);

                    // Create Activity feed item
                    await Activity.create({
                        user: userId,
                        type: "MILESTONE_REACHED",
                        platform: rule.platform,
                        metadata: {
                            title: rule.title,
                            badgeId: rule.badgeId,
                            tier: rule.tier,
                            description: rule.description,
                        },
                    });
                } catch (dupErr) {
                    // Ignore duplicate key race conditions
                }
            }
        }

        if (newlyUnlocked.length > 0) {
            console.log(`[Achievement Engine] User ${user.username} unlocked ${newlyUnlocked.length} new badges!`);
            // Invalidate user and profile cache
            await cacheService.delPattern(`*${user.username}*`);
            await cacheService.delPattern(`*user_${userId}*`);
        }

        return newlyUnlocked;
    } catch (error) {
        console.error("[Achievement Engine Error]:", error);
        return [];
    }
}

/**
 * Retrieves all achievements for a user, categorized by unlocked and locked.
 * @param {string|ObjectId} userId
 */
export async function getUserAchievements(userId) {
    const unlocked = await Achievement.find({ user: userId }).sort({ unlockedAt: -1 });
    const unlockedMap = new Map(unlocked.map((a) => [a.badgeId, a]));

    const catalogueWithStatus = ACHIEVEMENT_CATALOGUE.map((rule) => {
        const isUnlocked = unlockedMap.has(rule.badgeId);
        return {
            badgeId: rule.badgeId,
            title: rule.title,
            description: rule.description,
            platform: rule.platform,
            category: rule.category,
            icon: rule.icon,
            tier: rule.tier,
            unlocked: isUnlocked,
            unlockedAt: isUnlocked ? unlockedMap.get(rule.badgeId).unlockedAt : null,
        };
    });

    return {
        unlockedCount: unlocked.length,
        totalCount: ACHIEVEMENT_CATALOGUE.length,
        achievements: catalogueWithStatus,
    };
}
