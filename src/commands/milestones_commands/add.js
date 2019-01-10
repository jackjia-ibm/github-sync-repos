/**
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this
 * distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const chalk = require('chalk');
const { GitHub } = require('../../libs/github');
const {
  RESPONSE_FORMAT_JSON,
  RESPONSE_FORMAT_PLAIN,
} = require('../../libs/constants');

const builder = (yargs) => {
  yargs
    .positional('milesone', {
      describe: 'Milestone title.',
      type: 'string',
    })
    .options({
      repository: {
        alias: 'repo',
        description: 'Repository name. Add milestone to this repository. Default value is the template repository.',
        group: 'Milestone Options',
      },
      description: {
        alias: 'desc',
        description: 'Milestone description.',
        group: 'Milestone Options',
      },
      'due-on': {
        alias: 'due',
        description: 'Milestone due date.',
        group: 'Milestone Options',
      },
      state: {
        description: 'Milestone state. Can be open or closed.',
        group: 'Milestone Options',
      },
    });
};

const handler = async (options) => {
  const logger = options.logger;
  const gh = new GitHub(options);
  const repo = options.repository || options.templateRepo;
  if (!repo) {
    throw new Error('Repository is required.');
  }
  const title = options.milesone;
  const description = options.description;
  const dueOn = options.dueOn;
  const state = options.state;

  try {
    const data = await gh.createMilestone(repo, title, description, dueOn, state);

    if (options.format === RESPONSE_FORMAT_JSON) {
      logger.info(JSON.stringify(data));
    } else if (options.format === RESPONSE_FORMAT_PLAIN) {
      if (data.id) {
        logger.info(`"${chalk.blue(data.title)}" is created successfully.`);
      } else {
        throw new Error('Milestone is failed to create due to unknown failure.');
      }
    }
  } catch (err) {
    if (err && err.response && err.response.status && err.response.status === 404) {
      throw new Error(`Repository ${chalk.red(repo)} doesn't exist.`);
    } else if (err && err.response && err.response.status && err.response.status === 422 &&
      err.response.data && err.response.data.message === 'Validation Failed' &&
      err.response.data.errors && err.response.data.errors[0] &&
      err.response.data.errors[0].code === 'already_exists') {
      if (options.verbose) {
        logger.debug(err);
      }
      throw new Error(`Milestone "${title}" already exists in repository "${repo}"`);
    } else {
      if (options.verbose) {
        logger.debug(err);
      }
      throw err;
    }
  }
};

module.exports = {
  command: 'add <milesone> [options]',
  aliases: ['create'],
  description: 'Add milestone to a repository.',
  builder,
  handler,
};
