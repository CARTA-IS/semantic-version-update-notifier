import { Octokit } from "@octokit/rest";

const core = require('@actions/core');
const github = require('@actions/github');
const semver = require('semver');

const {
  GITHUB_REPOSITORY,
  PERSONAL_TOKEN,
} = process.env;

const [owner, repoName] = (GITHUB_REPOSITORY as string).split('/');

async function run() {
  const octokit = await new Octokit({auth: PERSONAL_TOKEN})
  console.log(`[----${owner}/${repoName}----]`)
  let releases = await octokit.paginate(
    octokit.rest.repos.listReleases,
    {owner: owner, repo: repoName}
  )
  console.log(`Found ${releases.length} releases`)
  if (releases.length < 2) {
    return
  }

  const lastRelease = releases[0]
  const secondLastRelease = releases[1]
  console.log(lastRelease.tag_name)
  console.log(secondLastRelease.tag_name)

  const lastReleaseMajor = semver.major(lastRelease.tag_name)
  const lastReleaseMinor = semver.minor(lastRelease.tag_name)

  const secondLastReleaseMajor = semver.major(secondLastRelease.tag_name)
  const secondLastReleaseMinor = semver.minor(secondLastRelease.tag_name)

  let isMajorUpdated = false;
  let isMinorUpdated = false;
  let semanticTarget = ''
  if (lastReleaseMajor > secondLastReleaseMajor)  {
    semanticTarget = '주'
    isMajorUpdated = true;
  } else if (lastReleaseMinor > secondLastReleaseMinor) {
    semanticTarget = '부'
    isMinorUpdated = true;
  } else {
    return
  }

  console.log(`isMajorUpdated: ${isMajorUpdated}`)
  console.log(`isMinorUpdated: ${isMinorUpdated}`)

  const message = `${repoName} 의 **${semanticTarget}** 버전이 올라갔습니다 (${secondLastRelease.tag_name} -> ${lastRelease.tag_name})`
  console.log(message)
  core.setOutput('message', message)
}

run();
