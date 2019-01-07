/**
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this
 * distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const GH = require('github-api');

class GitHub {
  constructor(options) {
    // give default value
    if (!options) {
      options = {};
    }

    // init GitHub API instance
    const { username, password, token } = (options);
    if (!token && !(username && password)) {
      throw new Error('GitHub username/password or token is required.');
    }
    this.gh = new GH({ username, password, token });
    this.ghUser = this.gh.getUser();

    // init organization
    const { organization } = (options);
    this.organization = organization;
    // init github org or user object
    if (this.organization) {
      this.ghOrg = this.gh.getOrganization(this.organization);
    }

    // assign template repository
    const { templateRepo } = (options);
    this.templateRepo = templateRepo;

    // assign logger
    const { logger } = (options);
    this.logger = logger;
  }

  async getUserProfile() {
    if (this.ghUserProfile) {
      return this.ghUserProfile;
    }

    const profile = await this.ghUser.getProfile();

    if (!profile || !profile.data) {
      this.logger.debug(`API Response: ${profile}`);
      throw new Error('Invalid API response.');
    }

    this.ghUserProfile = profile && profile.data;
    return this.ghUserProfile;
  }

  async getIssues(repository) {
    let user;
    if (this.organization) {
      user = this.organization;
    } else {
      const profile = await this.getUserProfile();
      user = profile.login;
    }

    return this.gh.getIssues(user, repository);
  }

  async listRepositories() {
    let repos;

    if (this.organization) {
      repos = await this.ghOrg.getRepos();
    } else {
      repos = await this.ghUser.listRepos();
    }

    if (!repos || !repos.data) {
      this.logger.debug(`API Response: ${repos}`);
      throw new Error('Invalid API response.');
    }

    // only return direct owned repos
    return repos.data.filter(repo => {
      const repoOwnerType = repo && repo.owner && repo.owner.type;
      const repoOwnerName = repo && repo.owner && repo.owner.login;
      if (this.organization) {
        return repoOwnerType === 'Organization' && repoOwnerName === this.organization;
      } else {
        return repoOwnerType === 'User';
      }
    });
  }

  async listLabels(repository) {
    const issues = await this.getIssues(repository);
    const labels = await issues.listLabels();

    if (!labels || !labels.data) {
      this.logger.debug(`API Response: ${labels}`);
      throw new Error('Invalid API response.');
    }

    return labels && labels.data;
  }

  async listMilestones(repository) {
    const issues = await this.getIssues(repository);
    const milestones = await issues.listMilestones();

    if (!milestones || !milestones.data) {
      this.logger.debug(`API Response: ${milestones}`);
      throw new Error('Invalid API response.');
    }

    return milestones && milestones.data;
  }

  async createMilestone(repository, title, description = null, dueOn = null, state = null) {
    const issues = await this.getIssues(repository);
    let milestoneData = { title };
    if (description) {
      milestoneData.description = description;
    }
    if (dueOn) {
      milestoneData.due_on = dueOn;
    }
    if (state) {
      milestoneData.state = state;
    }
    const res = await issues.createMilestone(milestoneData);

    if (!res || !res.data) {
      this.logger.debug(`API Response: ${res}`);
      throw new Error('Invalid API response.');
    }

    return res && res.data;
  }
}

module.exports = {
  GitHub,
};
