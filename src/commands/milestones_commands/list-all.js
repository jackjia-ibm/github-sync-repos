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
    .options({
      'include-closed': {
        default: false,
        description: 'Show all milestones include closed.',
        type: 'boolean',
        group: 'Milestone Options',
      }
    });
};

const handler = async (options) => {
  const logger = options.logger;
  const gh = new GitHub(options);

  const repos = await gh.listRepositories();
  for (let repo of repos) {
    const data = await gh.listMilestones(repo.name, options.includeClosed);
    logger.info(`Total ${data.length} milestone(s) in repository ${chalk.blue(repo.name)}:\n`);

    for (let one of data) {
      let info = [`#${chalk.blue(one.number)}`];
      if (one.state === 'open') {
        info.push(`${chalk.bgYellow.black(one.title)}:`);
      } else {
        info.push(`${chalk.bgBlack.gray.strikethrough(one.title)}:`);
      }
      if (one.description) {
        info.push(one.description);
      }
      if (one.due_on) {
        info.push(chalk.magenta(' (📅 ' + one.due_on + ')'));
      }
      logger.info(` - ${info.join(' ')}`);
    }

    logger.info('');
  }
};

module.exports = {
  command: 'list-all [options]',
  aliases: ['ls-all'],
  description: 'List milestones from all repositories.',
  builder,
  handler,
};
