/**
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this
 * distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const chalk = require('chalk');
const { GitHub } = require('../../libs/github');

const builder = (yargs) => {
  yargs
    .positional('milesone', {
      describe: 'Miletsone to edit. Must be miletsone title.',
      type: 'string',
    })
    .options({
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

  const repos = await gh.listRepositories();
  logger.info(`Updating milestone "${chalk.blue(options.milestone)}" from ${repos.length} repositories:`);
  for (let repo of repos) {
    try {
      const milestone = await gh.findMilesoneByTitle(repo.name, options.milestone);
      await gh.updateMilestoneById(repo.name, milestone.number, updates);

      logger.info(` - ${chalk.blue(repo.name)}: ${chalk.green('success')}`);
    } catch (err) {
      if (err && err.message && err.message.indexOf('Cannot find milestone') > -1) {
        logger.info(` - ${chalk.blue(repo.name)}: ${chalk.yellow('doesn\'t exist')}`);
      } else {
        if (options.verbose) {
          logger.debug(err);
        }
        logger.info(` - ${chalk.blue(repo.name)}: ${chalk.red(err)}`);
      }
    }
  }
};

module.exports = {
  command: 'edit-all <milestone> [options]',
  aliases: ['update-all'],
  description: 'Update milestone information across all repositories.',
  builder,
  handler,
};
