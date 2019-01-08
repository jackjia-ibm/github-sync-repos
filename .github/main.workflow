workflow "Lint and Test" {
  on = "push"
  resolves = ["GitHub Action for npm"]
}

action "Install" {
  uses = "actions/npm@e7aaefed7c9f2e83d493ff810f17fa5ccd7ed437"
  runs = "npm install"
}

action "Lint" {
  uses = "actions/npm@e7aaefed7c9f2e83d493ff810f17fa5ccd7ed437"
  needs = ["Install"]
  runs = "npm run lint"
}

action "GitHub Action for npm" {
  uses = "actions/npm@e7aaefed7c9f2e83d493ff810f17fa5ccd7ed437"
  needs = ["Lint"]
  runs = "npm test"
  secrets = ["GSR_TEST_GITHUB_PASSWORD", "GSR_TEST_GITHUB_TOKEN", "GSR_TEST_GITHUB_USERNAME"]
}
