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
      describe: 'Miletsone to edit. Can be miletsone ID or title.',
      type: 'string',
    })
    .options({
      repository: {
        alias: 'repo',
        description: 'Repository name. Add milestone to this repository. Default value is the template repository.',
        group: 'Milestone Options',
      },
      title: {
        description: 'Milestone title.',
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

  try {
    let id = options.milestone;
    if (!`${id}`.match(/^[0-9]+$/)) {
      const milestone = await gh.findMilesoneByTitle(repo, id);
      id = milestone.number;
    }

    if (!options.title && !options.description && !options.dueOn && !options.state) {
      throw new Error('Nothing to update.');
    }
    let updates = {};
    if (options.title) {
      updates.title = options.title;
    }
    if (options.description) {
      updates.description = options.description;
    }
    if (options.dueOn) {
      updates.due_on = options.dueOn;
    }
    if (options.state) {
      updates.state = options.state;
    }
    const data = await gh.updateMilestoneById(repo, id, updates);

    if (options.format === RESPONSE_FORMAT_JSON) {
      logger.info(JSON.stringify(data));
    } else if (options.format === RESPONSE_FORMAT_PLAIN) {
      if (data.id) {
        logger.info(`"${chalk.blue(data.title)}" is updated successfully.`);
      } else {
        throw new Error('Milestone is failed to create due to unknown failure.');
      }
    }
  } catch (err) {
    if (err && err.response && err.response.status && err.response.status === 404) {
      throw new Error(`Repository ${chalk.red(repo)} or milestone "${chalk.red(options.milestone)}" doesn't exist.`);
    } else {
      if (options.verbose) {
        logger.debug(err);
      }
      throw err;
    }
  }
};

module.exports = {
  command: 'edit <milestone> [options]',
  aliases: ['update'],
  description: 'Update milestone information.',
  builder,
  handler,
};
