/**
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this
 * distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const chalk = require('chalk');
const { GitHub } = require('../../libs/github');

const handler = async (options) => {
  const logger = options.logger;
  const gh = new GitHub(options);

  const repos = await gh.listRepositories();
  for (let repo of repos) {
    const data = await gh.listLabels(repo.name);
    logger.info(`Total ${data.length} label(s) in repository ${chalk.blue(repo.name)}:\n`);

    for (let one of data) {
      const color = `#${one.color}`;
      logger.info(` - ${chalk.bgHex(color).black(one.name)}`);
    }

    logger.info('');
  }
};

module.exports = {
  command: 'list-all [options]',
  aliases: ['ls-all'],
  description: 'List labels from all repositories.',
  handler,
};
