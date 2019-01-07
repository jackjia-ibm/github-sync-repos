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
  yargs.positional('repository', {
    describe: 'Repository name. Default value is the template repository.',
    type: 'string',
  });
};

const handler = async (options) => {
  const logger = options.logger;
  const gh = new GitHub(options);
  const repo = options.repository || options.templateRepo;
  const milestoneTitle = options.milestone;

  try {
    const milestone = await gh.findMilesoneByTitle(repo, milestoneTitle);
    logger.info(`Milestone "${chalk.blue(milestoneTitle)}" is found in repository "${chalk.blue(repo)}".`);

    const repos = await gh.listRepositories();
    logger.info(`Total ${repos.length} repositories to sync:`);
    for (let oneRepo of repos) {
      if (oneRepo.name === repo) {
        logger.info(` - ${chalk.blue(oneRepo.name)}: ${chalk.green('skipped')}`);
        continue;
      }
      try {
        const data = await gh.createMilestone(oneRepo.name,
          milestone.title, milestone.description, milestone.due_on);
        if (data && data.id) {
          logger.info(` - ${chalk.blue(oneRepo.name)}: ${chalk.green('created')}`);
        } else {
          logger.info(` - ${chalk.blue(oneRepo.name)}: ${chalk.yellow('unknown error')}`);
        }
      } catch (rerr) {
        if (rerr && rerr.response && rerr.response.status && rerr.response.status === 422 &&
          rerr.response.data && rerr.response.data.message === 'Validation Failed' &&
          rerr.response.data.errors && rerr.response.data.errors[0] &&
          rerr.response.data.errors[0].code === 'already_exists') {
          logger.info(` - ${chalk.blue(oneRepo.name)}: ${chalk.yellow('already exists')}`);
        } else {
          if (options.verbose) {
            logger.debug(`Error: ${JSON.stringify(rerr)}`);
          }
          logger.info(` - ${chalk.blue(oneRepo.name)}: ${chalk.red(rerr)}`);
        }
      }
    }
  } catch (err) {
    if (err && err.response && err.response.status && err.response.status === 404) {
      throw new Error(`Repository ${chalk.red(repo)} doesn't exist.`);
    } else {
      if (options.verbose) {
        logger.debug(`Error: ${JSON.stringify(err)}`);
      }
      throw err;
    }
  }
};

module.exports = {
  command: 'sync <repository> <milestone>',
  description: 'Synchronize milestone to all other repositories.',
  builder,
  handler,
};
