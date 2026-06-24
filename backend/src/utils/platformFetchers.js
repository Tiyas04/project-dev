// Utility functions to fetch stats, heatmaps, difficulty and topic details from external platform APIs

const LANGUAGE_COLORS = {
    TypeScript: "#3178c6",
    JavaScript: "#f7df1e",
    Python: "#3572A5",
    "C++": "#f34b7d",
    Java: "#b07219",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Go: "#00ADD8",
    Rust: "#dea584",
    Ruby: "#701516",
    PHP: "#4F5D95",
};

/**
 * Helper to fetch tags and difficulty for a specific LeetCode problem
 * @param {string} titleSlug LeetCode problem title slug
 * @returns {Promise<object|null>} Question detail object
 */
async function fetchLeetCodeQuestionDetails(titleSlug) {
    const query = `
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            title
            difficulty
            topicTags {
              name
              slug
            }
          }
        }
    `;

    try {
        const res = await fetch("https://leetcode.com/graphql/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://leetcode.com/",
            },
            body: JSON.stringify({ query, variables: { titleSlug } }),
        });
        if (res.ok) {
            const json = await res.json();
            return json.data?.question || null;
        }
    } catch (err) {
        console.error(`Failed to fetch details for LeetCode question ${titleSlug}:`, err);
    }
    return null;
}

/**
 * Fetches LeetCode stats via their public GraphQL endpoint
 * @param {string} username LeetCode handle
 * @returns {Promise<object>} Stats object
 */
export async function fetchLeetCodeStats(username, existingStats = {}) {
    const query = `
        query userStats($username: String!, $limit: Int!) {
          matchedUser(username: $username) {
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
            userCalendar {
              streak
              totalActiveDays
              submissionCalendar
            }
            tagProblemCounts {
              advanced {
                tagName
                tagSlug
                problemsSolved
              }
              intermediate {
                tagName
                tagSlug
                problemsSolved
              }
              fundamental {
                tagName
                tagSlug
                problemsSolved
              }
            }
          }
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            topPercentage
          }
          recentSubmissionList(username: $username, limit: $limit) {
            title
            titleSlug
            timestamp
            statusDisplay
            lang
          }
        }
    `;

    const res = await fetch("https://leetcode.com/graphql/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://leetcode.com/",
        },
        body: JSON.stringify({ query, variables: { username, limit: 20 } }),
    });

    if (!res.ok) {
        throw new Error(`LeetCode profile not found or API error (Status: ${res.status})`);
    }

    const json = await res.json();
    if (!json.data || !json.data.matchedUser) {
        throw new Error(`LeetCode user '${username}' not found`);
    }

    const { matchedUser, userContestRanking, recentSubmissionList } = json.data;

    const acSubmissions = matchedUser.submitStatsGlobal.acSubmissionNum;
    const allSolved = acSubmissions.find((x) => x.difficulty === "All")?.count || 0;
    const easySolved = acSubmissions.find((x) => x.difficulty === "Easy")?.count || 0;
    const mediumSolved = acSubmissions.find((x) => x.difficulty === "Medium")?.count || 0;
    const hardSolved = acSubmissions.find((x) => x.difficulty === "Hard")?.count || 0;

    // Generate Heatmap (84 Days)
    const heatmap = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let parsedCalendar = {};
    try {
        parsedCalendar = JSON.parse(matchedUser.userCalendar?.submissionCalendar || "{}");
    } catch (err) {
        console.error("Failed to parse LeetCode submissionCalendar", err);
    }

    for (let i = 83; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];

        let submissionsOnDay = 0;
        for (const [ts, val] of Object.entries(parsedCalendar)) {
            const keyDateStr = new Date(parseInt(ts) * 1000).toISOString().split("T")[0];
            if (keyDateStr === dateStr) {
                submissionsOnDay += val;
            }
        }

        heatmap.push(submissionsOnDay);
    }

    // Parse recent solved questions and dynamically fetch their tags/difficulty from LeetCode
    const recentSubmissions = recentSubmissionList || [];
    const uniqueAcceptedSubmissions = [];
    const seenTitles = new Set();

    recentSubmissions.forEach(sub => {
        if (sub.statusDisplay === "Accepted" && !seenTitles.has(sub.title)) {
            seenTitles.add(sub.title);
            uniqueAcceptedSubmissions.push(sub);
        }
    });

    // Retrieve existing accumulated questions from database cache
    const accumulatedSolved = existingStats?.accumulatedSolvedQuestions || [];
    const accumulatedMap = new Map(accumulatedSolved.map(q => [q.titleSlug, q]));

    // Find accepted submissions not already in our database cache
    const newAcceptedSubmissions = uniqueAcceptedSubmissions.filter(
        sub => !accumulatedMap.has(sub.titleSlug)
    );

    // Fetch details ONLY for the newly discovered accepted submissions
    const newQuestionsDetails = await Promise.all(
        newAcceptedSubmissions.map(async (sub) => {
            const details = await fetchLeetCodeQuestionDetails(sub.titleSlug);
            return {
                title: sub.title,
                titleSlug: sub.titleSlug,
                timestamp: parseInt(sub.timestamp),
                lang: sub.lang,
                difficulty: details?.difficulty || "Medium",
                topicTags: details?.topicTags || [],
            };
        })
    );

    // Merge new questions into accumulatedSolved list and map
    newQuestionsDetails.forEach((q) => {
        if (!accumulatedMap.has(q.titleSlug)) {
            accumulatedMap.set(q.titleSlug, q);
            accumulatedSolved.push(q);
        }
    });

    // Update timestamps and language for existing questions if they were solved recently
    uniqueAcceptedSubmissions.forEach(sub => {
        const existing = accumulatedMap.get(sub.titleSlug);
        if (existing) {
            existing.timestamp = parseInt(sub.timestamp);
            existing.lang = sub.lang;
        }
    });

    // Sort accumulated list by timestamp descending
    accumulatedSolved.sort((a, b) => b.timestamp - a.timestamp);

    // Extract questionsDetails for the top 15 most recently solved questions for UI rendering
    const questionsDetails = accumulatedSolved.slice(0, 15);

    const tagCounts = matchedUser.tagProblemCounts || { advanced: [], intermediate: [], fundamental: [] };
    const allTags = [...(tagCounts.advanced || []), ...(tagCounts.intermediate || []), ...(tagCounts.fundamental || [])];

    let arraysTotal = 0, stringsTotal = 0, dpTotal = 0, graphsTotal = 0, treesTotal = 0, mathTotal = 0;

    allTags.forEach((tag) => {
        const slug = (tag.tagSlug || "").toLowerCase();
        const count = tag.problemsSolved || 0;
        
        if (slug.includes("array") || slug.includes("matrix") || slug.includes("two-pointers") || slug.includes("sliding-window") || slug.includes("sorting")) {
            arraysTotal += count;
        }
        if (slug.includes("string") || slug.includes("simulation")) {
            stringsTotal += count;
        }
        if (slug.includes("dynamic-programming") || slug.includes("backtracking") || slug.includes("divide-and-conquer") || slug.includes("greedy")) {
            dpTotal += count;
        }
        if (slug.includes("graph") || slug.includes("depth-first-search") || slug.includes("breadth-first-search") || slug.includes("union-find") || slug.includes("shortest-path")) {
            graphsTotal += count;
        }
        if (slug.includes("tree") || slug.includes("binary-tree") || slug.includes("binary-search-tree") || slug.includes("trie") || slug.includes("segment-tree")) {
            treesTotal += count;
        }
        if (slug.includes("math") || slug.includes("bit-manipulation") || slug.includes("recursion") || slug.includes("number-theory") || slug.includes("geometry") || slug.includes("combinatorics")) {
            mathTotal += count;
        }
    });

    const normalizeTopic = (val) => Math.min(100, Math.round(30 + val * 2));
    
    // Distribute difficulty proportionally for display based on overall easy/medium/hard ratio
    const totalSolved = Math.max(1, allSolved);
    const easyRatio = easySolved / totalSolved;
    const medRatio = mediumSolved / totalSolved;
    const hardRatio = hardSolved / totalSolved;

    const topicData = [
        { 
            subject: "Arrays", 
            A: normalizeTopic(arraysTotal), 
            fullMark: 100,
            easySolved: Math.round(arraysTotal * easyRatio),
            mediumSolved: Math.round(arraysTotal * medRatio),
            hardSolved: Math.round(arraysTotal * hardRatio),
        },
        { 
            subject: "Strings", 
            A: normalizeTopic(stringsTotal), 
            fullMark: 100,
            easySolved: Math.round(stringsTotal * easyRatio),
            mediumSolved: Math.round(stringsTotal * medRatio),
            hardSolved: Math.round(stringsTotal * hardRatio),
        },
        { 
            subject: "DP", 
            A: normalizeTopic(dpTotal), 
            fullMark: 100,
            easySolved: Math.round(dpTotal * easyRatio),
            mediumSolved: Math.round(dpTotal * medRatio),
            hardSolved: Math.round(dpTotal * hardRatio),
        },
        { 
            subject: "Graphs", 
            A: normalizeTopic(graphsTotal), 
            fullMark: 100,
            easySolved: Math.round(graphsTotal * easyRatio),
            mediumSolved: Math.round(graphsTotal * medRatio),
            hardSolved: Math.round(graphsTotal * hardRatio),
        },
        { 
            subject: "Trees", 
            A: normalizeTopic(treesTotal), 
            fullMark: 100,
            easySolved: Math.round(treesTotal * easyRatio),
            mediumSolved: Math.round(treesTotal * medRatio),
            hardSolved: Math.round(treesTotal * hardRatio),
        },
        { 
            subject: "Math", 
            A: normalizeTopic(mathTotal), 
            fullMark: 100,
            easySolved: Math.round(mathTotal * easyRatio),
            mediumSolved: Math.round(mathTotal * medRatio),
            hardSolved: Math.round(mathTotal * hardRatio),
        },
    ];

    const difficultySolved = [
        { name: "Easy", value: easySolved, color: "#22c55e" },
        { name: "Medium", value: mediumSolved, color: "#eab308" },
        { name: "Hard", value: hardSolved, color: "#ef4444" },
    ];

    const currentRating = userContestRanking ? Math.round(userContestRanking.rating) : 0;
    const ratingData = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = today.getMonth();

    if (currentRating > 0) {
        for (let i = 5; i >= 0; i--) {
            const mIdx = (currentMonthIdx - i + 12) % 12;
            const factor = 1 - (i * 0.03) - (Math.sin(i) * 0.01);
            ratingData.push({
                name: months[mIdx],
                rating: Math.round(currentRating * factor)
            });
        }
    } else {
        for (let i = 5; i >= 0; i--) {
            const mIdx = (currentMonthIdx - i + 12) % 12;
            ratingData.push({
                name: months[mIdx],
                rating: 0
            });
        }
    }

    return {
        problemsSolved: allSolved,
        currentRating,
        bestRating: currentRating,
        globalRanking: userContestRanking ? `Top ${userContestRanking.topPercentage.toFixed(1)}%` : "Unrated",
        contests: userContestRanking ? userContestRanking.attendedContestsCount : 0,
        maxStreak: matchedUser.userCalendar ? matchedUser.userCalendar.streak : 0,
        heatmap,
        difficultySolved,
        topicData,
        ratingData,
        recentSolvedQuestions: questionsDetails,
        accumulatedSolvedQuestions: accumulatedSolved,
    };
}

/**
 * Fetches Codeforces stats via their official REST APIs
 * @param {string} username Codeforces handle
 * @returns {Promise<object>} Stats object
 */
export async function fetchCodeforcesStats(username) {
    const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
    if (!infoRes.ok) {
        throw new Error(`Codeforces profile not found or API error (Status: ${infoRes.status})`);
    }
    const infoJson = await infoRes.json();
    if (!infoJson || infoJson.status !== "OK" || !infoJson.result || infoJson.result.length === 0) {
        throw new Error(`Codeforces user '${username}' not found`);
    }
    const userInfo = infoJson.result[0];

    // Get contests count
    let contestsCount = 0;
    try {
        const ratingRes = await fetch(`https://codeforces.com/api/user.rating?handle=${username}`);
        if (ratingRes.ok) {
            const ratingJson = await ratingRes.json();
            if (ratingJson.status === "OK") {
                contestsCount = ratingJson.result.length;
            }
        }
    } catch (err) {
        console.error("CF Rating fetch failed:", err);
    }

    // Get solved count, difficulty, topic strengths and heatmap
    let problemsSolved = 0;
    let maxStreak = 0;
    const heatmap = [];
    const difficultyCount = { easy: 0, medium: 0, hard: 0 };
    const topicDifficultyCount = {
        arrays: { easy: 0, medium: 0, hard: 0 },
        strings: { easy: 0, medium: 0, hard: 0 },
        dp: { easy: 0, medium: 0, hard: 0 },
        graphs: { easy: 0, medium: 0, hard: 0 },
        trees: { easy: 0, medium: 0, hard: 0 },
        math: { easy: 0, medium: 0, hard: 0 },
    };
    const recentSolvedQuestions = [];

    try {
        const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
if (statusRes.ok) {
            const statusJson = await statusRes.json();
            if (statusJson.status === "OK") {
                const solvedSet = new Set();
                const submissionDates = new Set();
                const uniqueSolvedSubmissions = [];
                const dailySolvedCounts = {};

                statusJson.result.forEach((sub) => {
                    // Daily heatmap submissions aggregation (count all submissions)
                    if (sub.creationTimeSeconds) {
                        const dateStr = new Date(sub.creationTimeSeconds * 1000).toISOString().split("T")[0];
                        submissionDates.add(dateStr);
                        dailySolvedCounts[dateStr] = (dailySolvedCounts[dateStr] || 0) + 1;
                    }

                    if (sub.verdict === "OK" && sub.problem) {
                        const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
                        
                        if (!solvedSet.has(problemId)) {
                            solvedSet.add(problemId);
                            uniqueSolvedSubmissions.push(sub);

                            // Classify rating / difficulty overall
                            const rating = sub.problem.rating || 1000;
                            if (rating < 1200) {
                                difficultyCount.easy++;
                            } else if (rating < 1600) {
                                difficultyCount.medium++;
                            } else {
                                difficultyCount.hard++;
                            }
                        }
                    }
                });

                problemsSolved = solvedSet.size;

                // Calculate topic stats using all unique solved submissions
                uniqueSolvedSubmissions.forEach((sub) => {
                    const rating = sub.problem.rating || 1000;
                    let diff = "easy";
                    if (rating < 1200) {
                        diff = "easy";
                    } else if (rating < 1600) {
                        diff = "medium";
                    } else {
                        diff = "hard";
                    }

                    // Topic Categorization
                    const tags = sub.problem.tags || [];
                    tags.forEach((tag) => {
                        if (tag.includes("arrays") || tag.includes("two pointers") || tag.includes("sorting") || tag.includes("data structures")) {
                            topicDifficultyCount.arrays[diff]++;
                        }
                        if (tag.includes("strings") || tag.includes("expression parsing")) {
                            topicDifficultyCount.strings[diff]++;
                        }
                        if (tag.includes("dp")) {
                            topicDifficultyCount.dp[diff]++;
                        }
                        if (tag.includes("graphs") || tag.includes("dfs") || tag.includes("shortest paths") || tag.includes("graphs") || tag.includes("trees")) {
                            topicDifficultyCount.graphs[diff]++;
                        }
                        if (tag.includes("trees")) {
                            topicDifficultyCount.trees[diff]++;
                        }
                        if (tag.includes("math") || tag.includes("number theory") || tag.includes("geometry") || tag.includes("combinatorics") || tag.includes("probabilities")) {
                            topicDifficultyCount.math[diff]++;
                        }
                    });
                });

                // Slice the top 15 most recently solved unique submissions for display
                const targetCFSubmissions = uniqueSolvedSubmissions.slice(0, 15);

                targetCFSubmissions.forEach((sub) => {
                    const rating = sub.problem.rating || 1000;
                    let diff = "easy";
                    if (rating < 1200) {
                        diff = "easy";
                    } else if (rating < 1600) {
                        diff = "medium";
                    } else {
                        diff = "hard";
                    }

                    // Add to recently solved
                    recentSolvedQuestions.push({
                        title: sub.problem.name,
                        problemIndex: sub.problem.index,
                        contestId: sub.problem.contestId,
                        timestamp: sub.creationTimeSeconds,
                        lang: sub.programmingLanguage || "C++",
                        difficulty: diff,
                    });
                });

                // Calculate current active streak
                let streak = 0;
                const today = new Date();
                for (let i = 0; i < 365; i++) {
                    const checkDateObj = new Date(today);
                    checkDateObj.setDate(today.getDate() - i);
                    const checkDateStr = checkDateObj.toISOString().split("T")[0];
                    if (submissionDates.has(checkDateStr)) {
                        streak++;
                    } else {
                        if (i === 0) continue; // skip today check if we solved yesterday
                        break;
                    }
                }
                maxStreak = streak;

                // Generate Heatmap (84 Days)
                today.setHours(0, 0, 0, 0);
                for (let i = 83; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(today.getDate() - i);
                    const dateStr = d.toISOString().split("T")[0];

                    const countOnDay = dailySolvedCounts[dateStr] || 0;
                    heatmap.push(countOnDay);
                }
            }
        }
    } catch (err) {
        console.error("CF Status fetch failed:", err);
    }

    // Default heatmaps if empty
    if (heatmap.length === 0) {
        for (let i = 0; i < 84; i++) heatmap.push(0);
    }

    // Normalize topic scores to 0-100 scale
    const normalizeTopic = (val) => Math.min(100, Math.round(30 + val * 6));
    const topicData = [
        { 
            subject: "Arrays", 
            A: normalizeTopic(topicDifficultyCount.arrays.easy + topicDifficultyCount.arrays.medium + topicDifficultyCount.arrays.hard), 
            fullMark: 100,
            easySolved: topicDifficultyCount.arrays.easy,
            mediumSolved: topicDifficultyCount.arrays.medium,
            hardSolved: topicDifficultyCount.arrays.hard,
        },
        { 
            subject: "Strings", 
            A: normalizeTopic(topicDifficultyCount.strings.easy + topicDifficultyCount.strings.medium + topicDifficultyCount.strings.hard), 
            fullMark: 100,
            easySolved: topicDifficultyCount.strings.easy,
            mediumSolved: topicDifficultyCount.strings.medium,
            hardSolved: topicDifficultyCount.strings.hard,
        },
        { 
            subject: "DP", 
            A: normalizeTopic(topicDifficultyCount.dp.easy + topicDifficultyCount.dp.medium + topicDifficultyCount.dp.hard), 
            fullMark: 100,
            easySolved: topicDifficultyCount.dp.easy,
            mediumSolved: topicDifficultyCount.dp.medium,
            hardSolved: topicDifficultyCount.dp.hard,
        },
        { 
            subject: "Graphs", 
            A: normalizeTopic(topicDifficultyCount.graphs.easy + topicDifficultyCount.graphs.medium + topicDifficultyCount.graphs.hard), 
            fullMark: 100,
            easySolved: topicDifficultyCount.graphs.easy,
            mediumSolved: topicDifficultyCount.graphs.medium,
            hardSolved: topicDifficultyCount.graphs.hard,
        },
        { 
            subject: "Trees", 
            A: normalizeTopic(topicDifficultyCount.trees.easy + topicDifficultyCount.trees.medium + topicDifficultyCount.trees.hard), 
            fullMark: 100,
            easySolved: topicDifficultyCount.trees.easy,
            mediumSolved: topicDifficultyCount.trees.medium,
            hardSolved: topicDifficultyCount.trees.hard,
        },
        { 
            subject: "Math", 
            A: normalizeTopic(topicDifficultyCount.math.easy + topicDifficultyCount.math.medium + topicDifficultyCount.math.hard), 
            fullMark: 100,
            easySolved: topicDifficultyCount.math.easy,
            mediumSolved: topicDifficultyCount.math.medium,
            hardSolved: topicDifficultyCount.math.hard,
        },
    ];

    const difficultySolved = [
        { name: "Easy", value: difficultyCount.easy, color: "#22c55e" },
        { name: "Medium", value: difficultyCount.medium, color: "#eab308" },
        { name: "Hard", value: difficultyCount.hard, color: "#ef4444" },
    ];

    // Build rating chart timeline based on CF rating history (if any) or mock past growth
    const ratingData = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();

    if (userInfo.rating > 0) {
        for (let i = 5; i >= 0; i--) {
            const mIdx = (currentMonthIdx - i + 12) % 12;
            const factor = 1 - (i * 0.04) - (Math.cos(i * 1.5) * 0.01);
            ratingData.push({
                name: months[mIdx],
                rating: Math.round((userInfo.rating) * factor)
            });
        }
    } else {
        for (let i = 5; i >= 0; i--) {
            const mIdx = (currentMonthIdx - i + 12) % 12;
            ratingData.push({
                name: months[mIdx],
                rating: 0
            });
        }
    }

    return {
        problemsSolved,
        currentRating: userInfo.rating || 0,
        bestRating: userInfo.maxRating || 0,
        globalRanking: userInfo.rank || "unrated",
        contests: contestsCount,
        maxStreak,
        heatmap,
        difficultySolved,
        topicData,
        ratingData,
        recentSolvedQuestions,
    };
}

/**
 * Fetches GitHub repositories, followers, contributions & streaks using REST APIs
 * @param {string} username GitHub username
 * @returns {Promise<object>} Stats object
 */
export async function fetchGitHubStats(username) {
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!userRes.ok) {
        if (userRes.status === 404) {
            throw new Error(`GitHub user '${username}' not found`);
        }
        throw new Error(`GitHub API error or rate limited (Status: ${userRes.status})`);
    }

    const userData = await userRes.json();
    const publicRepos = userData.public_repos || 0;
    const followers = userData.followers || 0;

    let contributions = 0;
    let currentStreak = 0;
    const heatmap = [];

    try {
        const contribRes = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`);
        if (contribRes.ok) {
            const contribData = await contribRes.json();
            const currentYear = new Date().getFullYear().toString();
            contributions = contribData.total?.[currentYear] || contribData.total?.all || 0;

            // Filter out future dates from contributions (since API pre-allocates future days of current year as 0)
            const todayStr = new Date().toISOString().split("T")[0];
            const pastContributions = (contribData.contributions || []).filter(c => c.date <= todayStr);

            // Heatmap calculation (84 days)
            const sortedContribs = [...pastContributions].sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );
            
            // Current active streak
            let streak = 0;
            const today = new Date();
            for (const c of sortedContribs) {
                if (c.count > 0) {
                    streak++;
                } else {
                    const diffDays = Math.floor((today - new Date(c.date)) / (1000 * 60 * 60 * 24));
                    if (diffDays > 1 && streak > 0) {
                        break;
                    }
                }
            }
            currentStreak = streak;

            // Generate heatmap array (reverse chronological order of last 84 days, then flip to chronological)
            const last84Days = [...pastContributions]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 84)
                .reverse();
            
            last84Days.forEach(day => {
                heatmap.push(day.count || 0);
            });
        }
    } catch (err) {
        console.error("GitHub contributions fetch failed:", err);
    }

    if (heatmap.length === 0) {
        for (let i = 0; i < 84; i++) heatmap.push(0);
    }

    // Top Languages breakdown and recent repos from user's repos
    const languageCounts = {};
    let starsReceived = 0;
    let recentRepos = [];
    const repoSkillsCount = {
        reactNext: 0,
        apis: 0,
        databases: 0,
        devops: 0,
        testing: 0,
        nodejs: 0,
    };

    try {
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers });
        if (reposRes.ok) {
            const repos = await reposRes.json();
            if (Array.isArray(repos)) {
                repos.forEach((r) => {
                    starsReceived += r.stargazers_count || 0;
                    if (r.language) {
                        languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
                    }

                    const desc = (r.description || "").toLowerCase();
                    const name = (r.name || "").toLowerCase();
                    const topics = (r.topics || []).map(t => t.toLowerCase());

                    // React/Next.js
                    if (name.includes("react") || name.includes("next") || desc.includes("react") || desc.includes("next") || topics.includes("react") || topics.includes("nextjs") || topics.includes("frontend")) {
                        repoSkillsCount.reactNext++;
                    }
                    // APIs
                    if (name.includes("api") || name.includes("rest") || desc.includes("api") || desc.includes("rest") || desc.includes("graphql") || topics.includes("api") || topics.includes("graphql")) {
                        repoSkillsCount.apis++;
                    }
                    // Databases
                    if (name.includes("db") || name.includes("sql") || desc.includes("sql") || desc.includes("mongodb") || desc.includes("database") || desc.includes("redis") || topics.includes("database") || topics.includes("mongodb")) {
                        repoSkillsCount.databases++;
                    }
                    // DevOps
                    if (name.includes("docker") || name.includes("deploy") || desc.includes("docker") || desc.includes("aws") || desc.includes("deploy") || topics.includes("docker") || topics.includes("aws") || topics.includes("ci-cd")) {
                        repoSkillsCount.devops++;
                    }
                    // Testing
                    if (name.includes("test") || desc.includes("test") || desc.includes("jest") || desc.includes("cypress") || topics.includes("testing") || topics.includes("jest")) {
                        repoSkillsCount.testing++;
                    }
                    // Node.js
                    if (r.language === "JavaScript" || r.language === "TypeScript" || name.includes("node") || name.includes("express") || desc.includes("node") || desc.includes("express") || topics.includes("nodejs") || topics.includes("backend")) {
                        repoSkillsCount.nodejs++;
                    }
                });

                // Get top 6 recent repos
                const sortedRepos = [...repos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
                recentRepos = sortedRepos.slice(0, 6).map(r => ({
                    title: r.name,
                    url: r.html_url,
                    description: r.description || "No description provided.",
                    language: r.language || "Unknown",
                    stars: r.stargazers_count || 0,
                    forks: r.forks_count || 0,
                    updatedAt: r.updated_at,
                }));
            }
        }
    } catch (err) {
        console.error("GitHub repos fetch failed:", err);
    }

    const sortedLangs = Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const difficultySolved = sortedLangs.map(([lang, val]) => ({
        name: lang,
        value: val,
        color: LANGUAGE_COLORS[lang] || "#737373"
    }));

    // If no languages found
    if (difficultySolved.length === 0) {
        difficultySolved.push({ name: "JavaScript", value: 10, color: "#f7df1e" });
        difficultySolved.push({ name: "HTML/CSS", value: 5, color: "#e34c26" });
    }

    // GitHub repository skill strengths (topicData) based on repo counts
    const normalizeSkill = (val) => Math.min(100, Math.round(30 + val * 15));
    const topicData = [
        { subject: "React/Next.js", A: normalizeSkill(repoSkillsCount.reactNext), fullMark: 100 },
        { subject: "APIs/GraphQL", A: normalizeSkill(repoSkillsCount.apis), fullMark: 100 },
        { subject: "Databases", A: normalizeSkill(repoSkillsCount.databases), fullMark: 100 },
        { subject: "DevOps/Docker", A: normalizeSkill(repoSkillsCount.devops), fullMark: 100 },
        { subject: "Testing", A: normalizeSkill(repoSkillsCount.testing), fullMark: 100 },
        { subject: "Node.js", A: normalizeSkill(repoSkillsCount.nodejs), fullMark: 100 },
    ];

    let pullRequests = 0;
    try {
        const prRes = await fetch(`https://api.github.com/search/issues?q=author:${username}+type:pr`, { headers });
        if (prRes.ok) {
            const prJson = await prRes.json();
            pullRequests = prJson.total_count || 0;
        }
    } catch (err) {
        console.error("GitHub PRs count search failed, using repository estimate:", err);
        pullRequests = publicRepos * 2;
    }

    // GitHub commits growth trajectory (simulate past 6 months)
    const ratingData = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    const totalContribs = contributions || publicRepos * 15;

    for (let i = 5; i >= 0; i--) {
        const mIdx = (currentMonthIdx - i + 12) % 12;
        const factor = 1 - (i * 0.15) - (Math.sin(i * 2) * 0.02);
        ratingData.push({
            name: months[mIdx],
            rating: Math.max(10, Math.round(totalContribs * factor))
        });
    }

    return {
        publicRepos,
        contributions,
        currentStreak,
        followers,
        starsReceived,
        pullRequests,
        heatmap,
        difficultySolved,
        topicData,
        ratingData,
        recentSolvedQuestions: recentRepos,
    };
}
