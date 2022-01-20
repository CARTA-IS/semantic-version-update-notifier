import * as core from '@actions/core'
import {Octokit} from '@octokit/rest'
import semver from 'semver'

const {GITHUB_REPOSITORY, PERSONAL_TOKEN} = process.env

const [owner, repoName] = (GITHUB_REPOSITORY as string).split('/')

async function run(): Promise<undefined> {
  const octokit = new Octokit({auth: PERSONAL_TOKEN})
  core.info(`[----${owner}/${repoName}----]`)
  const releases = await octokit.paginate(octokit.rest.repos.listReleases, {
    owner,
    repo: repoName
  })
  core.info(`Found ${releases.length} releases`)
  if (releases.length < 2) {
    return
  }

  const lastRelease = releases[0]
  const secondLastRelease = releases[1]
  core.info(lastRelease.tag_name)
  core.info(secondLastRelease.tag_name)

  const lastReleaseMajor = semver.major(lastRelease.tag_name)
  const lastReleaseMinor = semver.minor(lastRelease.tag_name)

  const secondLastReleaseMajor = semver.major(secondLastRelease.tag_name)
  const secondLastReleaseMinor = semver.minor(secondLastRelease.tag_name)

  let isMajorUpdated = false
  let isMinorUpdated = false
  let semanticTarget = ''
  if (lastReleaseMajor > secondLastReleaseMajor) {
    semanticTarget = '주'
    isMajorUpdated = true
  } else if (lastReleaseMinor > secondLastReleaseMinor) {
    semanticTarget = '부'
    isMinorUpdated = true
  } else {
    return
  }

  core.info(`isMajorUpdated: ${isMajorUpdated}`)
  core.info(`isMinorUpdated: ${isMinorUpdated}`)

  const message = `${repoName} 의 **${semanticTarget}** 버전이 올라갔습니다 (${secondLastRelease.tag_name} -> ${lastRelease.tag_name})`
  core.info(message)
  core.setOutput('message', message)
}

run()
