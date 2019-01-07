workflow "Lint and Test" {
  on = "push"
  resolves = ["Lint"]
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
