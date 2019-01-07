/**
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this
 * distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const octokit = require('@octokit/rest')();

class GitHub {
  constructor(options) {
    // give default value
    if (!options) {
      options = {};
    }

    // init GitHub API instance
    const { username, password, token } = (options);
    if (token) {
      octokit.authenticate({
        type: 'token',
        token,
      });
    } else if (username && password) {
      octokit.authenticate({
        type: 'basic',
        username,
        password,
      });
    } else {
      throw new Error('GitHub username/password or token is required.');
    }
    this.octokit = octokit;

    // init organization
    const { organization } = (options);
    this.organization = organization;

    // assign template repository
    const { templateRepo } = (options);
    this.templateRepo = templateRepo;

    // assign logger
    const { logger } = (options);
    this.logger = logger;
  }

  async getUserProfile() {
    if (this._profile) {
      return this._profile;
    }

    const profile = await this.octokit.users.getAuthenticated();

    if (!profile || !profile.data) {
      this.logger.debug(`API Response: ${profile}`);
      throw new Error('Invalid API response.');
    }

    this._profile = profile && profile.data;
    return this._profile;
  }

  async _getOwner() {
    if (this._owner) {
      return this._owner;
    }

    let owner;

    if (this.organization) {
      owner = this.organization;
    } else {
      const profile = await this.getUserProfile();
      owner = profile.login;
    }

    this._owner = owner;
    return this._owner;
  }

  async listRepositories() {
    let repos;

    const owner = await this._getOwner();
    if (this.organization) {
      repos = await this.octokit.paginate('GET /orgs/:org/repos', { org: owner });
    } else {
      repos = await this.octokit.paginate('GET /users/:username/repos', { username: owner });
    }

    // only return direct owned repos
    return repos.filter(repo => {
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
    const owner = await this._getOwner();
    const labels = await this.octokit.paginate('GET /repos/:owner/:repo/labels', {
      owner,
      repo: repository,
    });

    return labels;
  }

  async listMilestones(repository, includeClosed = false) {
    const owner = await this._getOwner();
    const milestones = await this.octokit.paginate('GET /repos/:owner/:repo/milestones', {
      owner,
      repo: repository,
      state: includeClosed ? 'all' : 'open',
    });

    return milestones;
  }

  async findMilesoneByTitle(repository, title) {
    const milestones = await this.listMilestones(repository, true);
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
    const owner = await this._getOwner();
    const res = await octokit.issues.getMilestone({
      owner,
      repo: repository,
      number: id,
    });

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
    const owner = await this._getOwner();
    const milestoneData = this._normalizeMilestoneDate(title, description, dueOn, state);
    const res = await this.octokit.issues.createMilestone({
      owner,
      repo: repository,
      ...milestoneData,
    });

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

    let res = null;
    if (milestoneId) { // update
      const milestoneData = this._normalizeMilestoneDate(title, description, dueOn, state);
      res = await this.updateMilestoneById(repository, milestoneId, milestoneData);
    } else {
      res = await this.createMilestone(repository, title, description, dueOn, state);
    }

    if (milestoneId) {
      res._action = 'updated';
    } else {
      res._action = 'created';
    }

    return res;
  }

  async updateMilestoneById(repository, id, updates) {
    const owner = await this._getOwner();
    const res = await octokit.issues.updateMilestone({
      owner,
      repo: repository,
      number: id,
      ...updates,
    });

    if (!res || !res.data) {
      this.logger.debug(`API Response: ${res}`);
      throw new Error('Invalid API response.');
    }

    return res && res.data;
  }

  async deleteMilestoneById(repository, id) {
    const owner = await this._getOwner();
    const res = await this.octokit.issues.deleteMilestone({
      owner,
      repo: repository,
      number: id
    });

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
