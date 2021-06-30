const { resolve } = require('path');
const { readFileSync } = require('fs');
const { readdir } = require('fs').promises;
const xmlParser = require('fast-xml-parser');

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

const deps = [];

(async () => {
  // const files = await getFiles('./foo-repo');
  // const foundFileName = files.find(file => file.includes('pom.xml'));
  const files = await getFiles('./repos/');
  const poms = files.filter(file => file.includes('pom.xml'));
  console.log(poms);
  poms.forEach(pathToPomFile => {
    const json = xmlParser.parse(readFileSync(pathToPomFile, 'utf8'));
    // console.log(pathToPomFile);
    // console.log(json?.project?.dependencies?.dependency);
    const deps1 = json?.project?.dependencyManagement?.dependencies?.dependency;
    const deps2 = json?.project?.dependencies?.dependency;
    if (deps1 && Array.isArray(deps1)) deps.push(...deps1);
    if (deps1 && !Array.isArray(deps1)) deps.push(deps1);
    if (deps2 && Array.isArray(deps2)) deps.push(...deps2);
    if (deps2 && !Array.isArray(deps2)) deps.push(deps2);
    // deps.push(...(json?.project?.dependencyManagement?.dependencies?.dependency || []));
    // deps.push(...(json?.project?.dependencies?.dependency || []));
  })
  console.log(deps.length)
  const uniqueDeps = new Set();
  deps.forEach(dep => {
    if (dep.groupId.includes('daimler') || dep.groupId.includes('zalando') || dep.groupId.includes('spotify')) console.log(dep);
    uniqueDeps.add(dep.groupId)
  })
  console.log(uniqueDeps);
  console.log(uniqueDeps.size);
})()
