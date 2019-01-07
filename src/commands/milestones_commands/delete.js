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
  const title = options.title;

  const data = await gh.deleteMilestone(repo, title);

  if (options.format === RESPONSE_FORMAT_JSON) {
    logger.info(JSON.stringify(data));
  } else if (options.format === RESPONSE_FORMAT_PLAIN) {
    logger.info(`"${chalk.blue(data.title)}" is deleted successfully.`);
  }
};

module.exports = {
  command: 'delete <repository> <title>',
  aliases: ['del', 'remove', 'rm'],
  description: 'Delete a milestone from the repository.',
  builder,
  handler,
};
