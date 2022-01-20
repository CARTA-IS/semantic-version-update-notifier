import {Octokit} from '@octokit/rest'
import core from '@actions/core'
import semver from 'semver'

const {GITHUB_REPOSITORY, PERSONAL_TOKEN} = process.env

const [owner, repoName] = (GITHUB_REPOSITORY as string).split('/')

async function run(): Promise<undefined> {
  const octokit = new Octokit({auth: PERSONAL_TOKEN})
  core.debug(`[----${owner}/${repoName}----]`)
  const releases = await octokit.paginate(octokit.rest.repos.listReleases, {
    owner,
    repo: repoName
  })
  core.debug(`Found ${releases.length} releases`)
  if (releases.length < 2) {
    return
  }

  const lastRelease = releases[0]
  const secondLastRelease = releases[1]
  core.debug(lastRelease.tag_name)
  core.debug(secondLastRelease.tag_name)

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

  core.debug(`isMajorUpdated: ${isMajorUpdated}`)
  core.debug(`isMinorUpdated: ${isMinorUpdated}`)

  const message = `${repoName} 의 **${semanticTarget}** 버전이 올라갔습니다 (${secondLastRelease.tag_name} -> ${lastRelease.tag_name})`
  core.debug(message)
  core.setOutput('message', message)
}

run()
