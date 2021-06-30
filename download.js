const fs = require('fs');
const simpleGit = require('simple-git');

// API response is limited to 30 per page, with 86 repos, we need to use pagination, example:
// https://git.foo.com/api/v3/orgs/bar/repos?access_token={PAT}&?per_page=100&page=2
const fileNames = [
    './repos1.json',
    './repos2.json',
    './repos3.json'
]

const allRepos = [];

fileNames.forEach(fileName => {
    const gitApiResponse = JSON.parse(fs.readFileSync(fileName));
    const repos = gitApiResponse.map(repo => {
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
    allRepos.push(...repos);
});


// console.table(allRepos);

/**
 * @function syncRepos
 * Does follow the idea of doing for each repo and branch:
    * `git clone <url>`
    * `git branch -r`
    * `git checkout --track origin/master`
    * `git pull`
 * @param  {type} options `cloneFirst` - true|false - whether to clone repo first. False per default.
*/
const syncRepos = async (options) => {
    const { cloneFirst } = options;
    for (let i = 0; i < allRepos.length; i++) {
        const repo = allRepos[i];
        try {
            if (cloneFirst) {
                console.log('Cloning', repo.url);
                // await git.clone(repo.url);
                await simpleGit(`./repos`).clone(repo.url);
                console.log('Cloning okay');
            }
            console.log('Pulling branches');
            // gitWithRepoPath will execute commands like a shell-based git
            // hence, this will use the local git-configuration from that repo
            // this includes the remotes as configured during cloning
            const gitWithRepoPath = simpleGit(`./repos/${repo.name}`);
            const branches = await gitWithRepoPath.branch(['--remote']);
            console.log(branches.all);
            for (let i = 0; i < branches.all.length; i++) {
                const branch = branches.all[i];
                const branchName = branch.split('origin/')[1];
                console.log('Pulling', branchName);
                const resp = await gitWithRepoPath.checkout(branchName).pull();
                console.log(resp);
            }
        } catch (error) {
            console.log(error)
        }
    }
}

syncRepos({ cloneFirst: false })
