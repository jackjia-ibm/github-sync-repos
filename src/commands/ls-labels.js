/**
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this
 * distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const chalk = require('chalk');
const { GitHub } = require('../libs/github');
const {
  RESPONSE_FORMAT_JSON,
  RESPONSE_FORMAT_PLAIN,
} = require('../libs/constants');

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
    const data = await gh.listLabels(repo);

    if (options.format === RESPONSE_FORMAT_JSON) {
      logger.info(JSON.stringify(data));
    } else if (options.format === RESPONSE_FORMAT_PLAIN) {
      logger.info(`Total ${data.length} label(s) in repository ${chalk.blue(repo)}:\n`);

      for (let one of data) {
        const color = `#${one.color}`;
        logger.info(` - ${chalk.bgHex(color).black(one.name)}`);
      }
    }
  } catch (err) {
    if (err && err.response && err.response.status && err.response.status === 404) {
      throw new Error(`Repository ${chalk.red(repo)} doesn't exist.`);
    } else {
      throw err;
    }
  }
};

module.exports = {
  command: 'ls-labels [repository]',
  description: 'List labels of a repository.',
  builder,
  handler,
};
