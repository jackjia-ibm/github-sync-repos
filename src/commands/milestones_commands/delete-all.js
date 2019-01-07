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
      describe: 'Miletsone to delete. Must be milestone title.',
      type: 'string',
    });
};

const handler = async (options) => {
  const logger = options.logger;
  const gh = new GitHub(options);

  const repos = await gh.listRepositories();
  logger.info(`Deleting milestone "${chalk.blue(options.milestone)}" from ${repos.length} repositories:`);
  for (let repo of repos) {
    try {
      const milestone = await gh.findMilesoneByTitle(repo.name, options.milestone);
      await gh.deleteMilestoneById(repo.name, milestone.number);

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
  command: 'delete-all <milestone>',
  aliases: ['del-all', 'remove-all', 'rm-all'],
  description: 'Delete milestone from all repositoriess.',
  builder,
  handler,
};
