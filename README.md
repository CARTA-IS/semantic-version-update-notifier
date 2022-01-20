<p align="center">When the version up, let the team know what to update.</p>

--

## Usage

```YAML
name: version-update-notifier

on:
  # It's only used in releases[type:published]
  release:
    type: [published]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: CARTA-IS/sementic-version-update-notifier@0.1.0
        id: notifier
        env:
          # PAT is required to get information from private repository
          PERSONAL_TOKEN: ${{ secrets.PERSONAL_TOKEN }}

      - name: Send to Slack workflow
        if: ${{ steps.notifier.outputs.message }}
        uses: slackapi/slack-github-action@v1.17.0
        with:
          payload: |
            {
              "message": "${{ steps.notifier.outputs.message }}"
            }
          env:
            SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Code in Main

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:  
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
