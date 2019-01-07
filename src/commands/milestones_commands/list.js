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

  try {
    const data = await gh.listMilestones(repo);

    if (options.format === RESPONSE_FORMAT_JSON) {
      logger.info(JSON.stringify(data));
    } else if (options.format === RESPONSE_FORMAT_PLAIN) {
      logger.info(`Total ${data.length} milestone(s) in repository ${chalk.blue(repo)}:\n`);

      for (let one of data) {
        logger.info(` - ${chalk.bgYellow.black(one.title)}: ${one.description || ''}${one.due_on ? chalk.magenta(' (due on ' + one.due_on + ')') : ''}`);
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
  command: 'list [repository]',
  aliases: ['ls'],
  description: 'List milestones of a repository.',
  builder,
  handler,
};
