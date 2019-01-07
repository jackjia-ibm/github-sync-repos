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
    .positional('milestone', {
      describe: 'Miletsone to delete. Can be miletsone ID or title.',
      type: 'string',
    })
    .options({
      repository: {
        alias: 'repo',
        description: 'Repository name where can find the milestone. Default value is the template repository.',
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
    let milestone;
    if (`${id}`.match(/^[0-9]+$/)) {
      milestone = await gh.findMilestoneById(repo, id);
    } else {
      milestone = await gh.findMilesoneByTitle(repo, id);
    }

    logger.info(`Milestone "${chalk.blue(milestone.title)}" is found in repository "${chalk.blue(repo)}".`);

    const repos = await gh.listRepositories();
    logger.info(`Total ${repos.length} repositories to sync:`);
    for (let oneRepo of repos) {
      if (oneRepo.name === repo) {
        logger.info(` - ${chalk.blue(oneRepo.name)}: ${chalk.green('skipped')}`);
        continue;
      }
      try {
        const data = await gh.createOrUpdateMilestone(oneRepo.name,
          milestone.title, milestone.description, milestone.due_on, milestone.state);
        if (data && data.id) {
          logger.info(` - ${chalk.blue(oneRepo.name)}: ${chalk.green(data._action)}`);
        } else {
          logger.info(` - ${chalk.blue(oneRepo.name)}: ${chalk.yellow('unknown error')}`);
        }
      } catch (rerr) {
        if (options.verbose) {
          logger.debug(rerr);
        }
        logger.info(` - ${chalk.blue(oneRepo.name)}: ${chalk.red(rerr)}`);
      }
    }
  } catch (err) {
    if (err && err.response && err.response.status && err.response.status === 404) {
      throw new Error(`Repository ${chalk.red(repo)} doesn't exist.`);
    } else {
      if (options.verbose) {
        logger.debug(err);
      }
      throw err;
    }
  }
};

module.exports = {
  command: 'sync <milestone> [options]',
  description: 'Synchronize milestone to all other repositories.',
  builder,
  handler,
};
