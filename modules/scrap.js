const axios = require('axios');
const cheerio = require('cheerio');

class Scrap {
    constructor(username) {
        this.username = username;
    }

    async fetchResponse() {
        const BASE_URL = `https://auth.geeksforgeeks.org/user/${this.username}/practice/`;
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };

        try {
            const response = await axios.get(BASE_URL, { headers });

            if (response.status !== 200) {
                return { error: "Profile Not Found" };
            }

            const $ = cheerio.load(response.data);

            // Find the script tag containing JSON data
            const scriptTag = $('#__NEXT_DATA__[type="application/json"]');

            if (!scriptTag.length) {
                return { error: "Could not find user data" };
            }

            // Parse the JSON data
            try {
                const userData = JSON.parse(scriptTag.html());
                const userInfo = userData.props.pageProps.userInfo;
                const userSubmissions = userData.props.pageProps.userSubmissionsInfo;

                // Extract general information
                const generalInfo = {
                    userName: this.username,
                    fullName: userInfo.name || "",
                    profilePicture: userInfo.profile_image_url || "",
                    institute: userInfo.institute_name || "",
                    instituteRank: userInfo.institute_rank || "",
                    currentStreak: userInfo.pod_solved_longest_streak || "00",
                    maxStreak: userInfo.pod_solved_global_longest_streak || "00",
                    codingScore: userInfo.score || 0,
                    monthlyScore: userInfo.monthly_score || 0,
                    totalProblemsSolved: userInfo.total_problems_solved || 0,
                };

                // Extract solved questions by difficulty
                const solvedStats = {};
                for (const [difficulty, problems] of Object.entries(userSubmissions)) {
                    const questions = Object.values(problems).map(details => ({
                        question: details.pname,
                        questionUrl: `https://practice.geeksforgeeks.org/problems/${details.slug}`
                    }));

                    solvedStats[difficulty.toLowerCase()] = {
                        count: questions.length,
                        questions: questions
                    };
                }

                return {
                    info: generalInfo,
                    solvedStats: solvedStats
                };
            } catch (error) {
                return { error: "Failed to parse user data" };
            }
        } catch (error) {
            return { error: "Failed to fetch profile" };
        }
    }
}

module.exports = Scrap;
