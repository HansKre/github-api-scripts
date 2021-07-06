const fs = require('fs');
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
let reposMetaData = [];
const getMetdataForRepos = async (baseUrl, pageIndex) => {
    let _pageIndex = pageIndex || 1;
    const pageUrl = `${baseUrl}${_pageIndex}`;
    const apiResponse = await GET(pageUrl);
    if (apiResponse && apiResponse.length > 0) {
        console.log('Getting Repo-Metadata from', pageUrl)
        reposMetaData.push(...apiResponse);
        return getMetdataForRepos(baseUrl, _pageIndex + 1);
    } else {
        return reposMetaData;
    }
}

if (process.env.PERSONALACCESSTOKEN) {
    (async () => {
        const sourceUrl = `${process.env.API_ENDPOINT_SOURCE}/repos?access_token=${process.env.PERSONALACCESSTOKEN}&?per_page=100&page=`;
        const sourceRepos = await getMetdataForRepos(sourceUrl);
        reposMetaData = [];
        const mirrorUrl = `${process.env.API_ENDPOINT_MIRROR}/repos?access_token=${process.env.PERSONALACCESSTOKEN}&?per_page=100&page=`;
        const mirrorRepos = await getMetdataForRepos(mirrorUrl);
        const sourceNames = sourceRepos.map(e => e.name);
        const mirrorNames = mirrorRepos.map(e => e.name);
        const diffNames = sourceNames.filter(e => !mirrorNames.includes(e))
        console.log(diffNames);
    })();
} else {
    console.log('PERSONALACCESSTOKEN not set.')
}
