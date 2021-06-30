const fs = require('fs');
const axios = require('axios');

const repoFileNames = [
    './repos.json',
    './repos2.json',
    './repos3.json'
];

const statistics = [];

repoFileNames.forEach(repoFileName => {
    const gitApiResponse = JSON.parse(fs.readFileSync(repoFileName));
    const stats = gitApiResponse.map(e => {
        return {
            size: e.size,
            language: e.language,
            languages_url: e.languages_url,
            name: e.name
        }
    });
    statistics.push(...stats);
});

const finalStats = []

const asyncForLoop = async () => {
    for (let i = 0; i < statistics.length; i++) {
        const stat = statistics[i];
        const langs = await axios.get(stat.languages_url);
        finalStats.push({
            name: stat.name,
            size: stat.size,
            mainLanguage: stat.language,
            langs: langs
        })
    }
}

console.log(finalStats);
