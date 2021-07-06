const simpleGit = require('simple-git');
const axios = require('axios');
require('dotenv').config();

const GET = async (url) => {
    try {
        const { data } = await axios({
            method: 'get',
            url: url,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return data;
    } catch (error) {
        console.log(error.message);
        return null;
    }
}

// API response is limited to 30 per page, with 86 repos, we need to use pagination, example:
// https://git.foo.com/api/v3/orgs/bar/repos?access_token={PAT}&?per_page=100&page=2
const reposMetaData = [];
const getMetdataForRepos = async (pageIndex) => {
    const baseUrl = `${process.env.API_ENDPOINT_SOURCE}/repos?access_token=${process.env.PERSONALACCESSTOKEN}&?per_page=100&page=`;
    let _pageIndex = pageIndex || 1;
    const pageUrl = `${baseUrl}${_pageIndex}`;
    const apiResponse = await GET(pageUrl);
    if (apiResponse && apiResponse.length > 0) {
        console.log('Getting Repo-Metadata from', pageUrl)
        reposMetaData.push(...apiResponse);
        return getMetdataForRepos(_pageIndex + 1);
    } else {
        return reposMetaData;
    }
}

const mapRepoNameAndSshUrl = (responseMetaData) => {
    return responseMetaData.map(repo => {
        // to avoid being prompted for ssh-passphrase, we use a personal access token
        // set it first `export PERSONALACCESSTOKEN=123`
        // and then we can clone using a url like:
        // 'git clone https://user:token@git.foo.com/some-repo/foo-calls-report.git'
        const url = repo.ssh_url
        return {
            name: repo.name,
            url: url.replace('git@', `https://user:${process.env.PERSONALACCESSTOKEN}@`).replace('com:', 'com/')
        }
    });
}

const mirrorRepos = async (repos) => {
    for (const repo of repos) {
        try {
            console.log('Mirroring', repo.url);
            await simpleGit(`${process.env.TARGET_FOLDER}`).mirror(repo.url);
            console.log('Mirroring successful');
        } catch (error) {
            console.log(error.message)
        }
    }
}

if (process.env.PERSONALACCESSTOKEN) {
    (async () => {
        await mirrorRepos(mapRepoNameAndSshUrl(await getMetdataForRepos()));
        console.log('All done.');
    })();
} else {
    console.log('PERSONALACCESSTOKEN not set.')
}
