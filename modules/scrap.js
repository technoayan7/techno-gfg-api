const axios = require('axios');
const cheerio = require('cheerio');

class Scrap {
    constructor(username) {
        this.username = username;
    }

    async fetchResponse() {
        const BASE_URL = `https://auth.geeksforgeeks.org/user/${this.username}/practice/`;

        try {
            const htmlResponse = await axios.get(BASE_URL);
            if (htmlResponse.status === 200) {
                const html = htmlResponse.data;
                const $ = cheerio.load(html);
                const response = {};
                const solvedStats = {};
                const generalInfo = {};

                generalInfo.userName = this.username;
                generalInfo.profilePicture = $('.profile_pic').attr('src');
                generalInfo.instituteRank = $('.rankNum').text();
                const streak_details = $('.streakCnt').text().replace(" ", "").split("/");
                generalInfo.currentStreak = streak_details[0];
                generalInfo.maxStreak = streak_details[1];
                generalInfo.institution = $('.basic_details_data').eq(0).text().trim();
                generalInfo.languagesUsed = $('.basic_details_data').eq(1).text().trim();
                generalInfo.codingScore = $('.score_card_value').eq(0).text().trim();
                generalInfo.totalProblemsSolved = $('.score_card_value').eq(1).text().trim();
                generalInfo.monthlyCodingScore = $('.score_card_value').eq(2).text().trim();

                // Extract questions solved count for each difficulty level
                const difficulties = ["#school", "#basic", "#easy", "#medium", "#hard"];
                for (const difficulty of difficulties) {
                    solvedStats[difficulty.replace("#", "")] = extract_questions_by_difficulty($, difficulty);
                }

                response.info = generalInfo;
                response.solvedStats = solvedStats;

                return response;
            } else {
                return { error: "Profile Not Found" };
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return { error: "An error occurred while fetching data" };
        }
    }
}

function extract_text_from_elements(elements, element_keys) {
    const result = {};
    elements.each((index, element) => {
        try {
            const inner_text = $(element).text();
            result[element_keys[index]] = inner_text === '_ _' ? "" : inner_text;
        } catch (error) {
            result[element_keys[index]] = "";
        }
    });
    return result;
}

function extract_questions_by_difficulty($, difficulty) {
    try {
        const response = {};
        const questions = [];
        const question_list_by_difficulty_tag = $(`${difficulty} a`);
        response.count = question_list_by_difficulty_tag.length;
        question_list_by_difficulty_tag.each((index, question_tag) => {
            questions.push({
                question: $(question_tag).text(),
                questionUrl: $(question_tag).attr('href')
            });
        });
        response.questions = questions;
        return response;
    } catch (error) {
        return { count: 0, questions: [] };
    }
}

module.exports = { Scrap };
