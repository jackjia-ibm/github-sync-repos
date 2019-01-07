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

  async listMilestones(repository, includeClosed = false) {
    const issues = await this.getIssues(repository);
    let options = {};
    if (includeClosed) {
      options.state = 'all';
    }
    const milestones = await issues.listMilestones(options);

    if (!milestones || !milestones.data) {
      this.logger.debug(`API Response: ${milestones}`);
      throw new Error('Invalid API response.');
    }

    return milestones && milestones.data;
  }

  async findMilesoneByTitle(repository, title) {
    const milestones = await this.listMilestones(repository);
    let milestone = null;
    for (let ms of milestones) {
      if (ms.title === title) {
        milestone = ms;
      }
    }

    if (!milestone) {
      throw new Error(`Cannot find milestone "${title}" in repository "${repository}"`);
    }

    return milestone;
  }

  async findMilestoneById(repository, id) {
    const issues = await this.getIssues(repository);
    const res = await issues.getMilestone(id);

    if (!res || !res.data) {
      this.logger.debug(`API Response: ${res}`);
      throw new Error('Invalid API response.');
    }

    return res && res.data;
  }

  _normalizeMilestoneDate(title, description = null, dueOn = null, state = null) {
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

    return milestoneData;
  }

  async createMilestone(repository, title, description = null, dueOn = null, state = null) {
    const issues = await this.getIssues(repository);
    const milestoneData = this._normalizeMilestoneDate(title, description, dueOn, state);
    const res = await issues.createMilestone(milestoneData);

    if (!res || !res.data) {
      this.logger.debug(`API Response: ${res}`);
      throw new Error('Invalid API response.');
    }

    return res && res.data;
  }

  async createOrUpdateMilestone(repository, title, description = null, dueOn = null, state = null) {
    let milestoneId = null;
    try {
      const milestone = await this.findMilesoneByTitle(repository, title);
      milestoneId = milestone.number;
    } catch (err) {
      // ignore err
    }

    const milestoneData = this._normalizeMilestoneDate(title, description, dueOn, state);

    const issues = await this.getIssues(repository);
    let res = null;
    if (milestoneId) { // update
      res = await issues.editMilestone(milestoneId, milestoneData);
    } else {
      res = await issues.createMilestone(milestoneData);
    }

    if (!res || !res.data) {
      this.logger.debug(`API Response: ${res}`);
      throw new Error('Invalid API response.');
    }

    if (milestoneId) {
      res.data._action = 'updated';
    } else {
      res.data._action = 'created';
    }

    return res && res.data;
  }

  async updateMilestoneById(repository, id, updates) {
    const issues = await this.getIssues(repository);

    const res = await issues.editMilestone(id, updates);

    if (!res || !res.data) {
      this.logger.debug(`API Response: ${res}`);
      throw new Error('Invalid API response.');
    }

    return res && res.data;
  }

  async deleteMilestoneById(repository, id) {
    const issues = await this.getIssues(repository);

    const res = await issues.deleteMilestone(id);

    if (!res || !res.status || res.status !== 204) {
      this.logger.debug(`API Response: ${JSON.stringify(res)}`);
      throw new Error('Invalid API response.');
    }

    return true;
  }
}

module.exports = {
  GitHub,
};
