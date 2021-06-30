const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

// API response is limited to 30 per page, with 86 repos, we need to use pagination, example:
// https://git.bar.com/api/v3/orgs/foo/repos?access_token={PAT}&?per_page=100&page=2
const fileNames = [
    './repos1.json',
    './repos2.json',
    './repos3.json'
]

const allRepos = [];

fileNames.forEach(fileName => {
    const gitApiResponse = JSON.parse(fs.readFileSync(fileName));
    const repos = gitApiResponse.map(repo => {
        const url = repo.ssh_url
        return {
            name: repo.name,
            oldUrl: url.replace('git@', `https://user:${process.env.PERSONALACCESSTOKEN}@`).replace('com:', 'com/')
        }
    });
    allRepos.push(...repos);
});

// console.table(allRepos);

const apiEndpoint = `${process.env.API_ENDPOINT_MIRROR}/repos?access_token=${process.env.PERSONALACCESSTOKEN}`;

const createRepo = async (repoName) => {
    try {
        const { data } = await axios({
            method: 'post',
            url: apiEndpoint,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                "name": repoName
            })
        });
        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
}

/**
 * @function createRepos
 * https://docs.github.com/en/rest/reference/repos#create-an-organization-repository
 * POST https://git.bar.com/api/v3/orgs/mirror/repos?access_token=<PAT>
*/
const createRepos = async () => {
    const isError = false;
    for (let i = 0; i < allRepos.length; i++) {
        const repoName = allRepos[i].name;
        if (!isError) {
            try {
                console.log('Creating', repoName);
                await createRepo(repoName);
                console.log('Successful');
            } catch (error) {
                console.log(error)
                isError = true;
            }
        }
    }
}

createRepos();
