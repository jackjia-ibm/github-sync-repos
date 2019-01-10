workflow "Lint and Test" {
  on = "push"
  resolves = ["Publish"]
}

action "Install" {
  uses = "actions/npm@e7aaefed7c9f2e83d493ff810f17fa5ccd7ed437"
  args = "install"
}

action "Lint" {
  uses = "actions/npm@e7aaefed7c9f2e83d493ff810f17fa5ccd7ed437"
  needs = ["Install"]
  args = "run lint"
}

action "Test" {
  uses = "actions/npm@e7aaefed7c9f2e83d493ff810f17fa5ccd7ed437"
  needs = ["Lint"]
  args = "test"
  secrets = ["GSR_TEST_GITHUB_PASSWORD", "GSR_TEST_GITHUB_TOKEN", "GSR_TEST_GITHUB_USERNAME"]
}

action "Master" {
  uses = "actions/bin/filter@b2bea0749eed6beb495a8fa194c071847af60ea1"
  needs = ["Test"]
  args = "branch master"
}

action "Publish" {
  uses = "actions/npm@e7aaefed7c9f2e83d493ff810f17fa5ccd7ed437"
  needs = ["Master"]
  args = "publish --access public"
  secrets = ["NPM_AUTH_TOKEN"]
}
