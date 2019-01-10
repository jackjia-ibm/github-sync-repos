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
    .options({
      repository: {
        alias: 'repo',
        description: 'Repository name. List milestone(s) of this repository. Default value is the template repository.',
        group: 'Milestone Options',
      },
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
  const repo = options.repository || options.templateRepo;
  if (!repo) {
    throw new Error('Repository is required.');
  }

  try {
    const data = await gh.listMilestones(repo, options.includeClosed);

    if (options.format === RESPONSE_FORMAT_JSON) {
      logger.info(JSON.stringify(data));
    } else if (options.format === RESPONSE_FORMAT_PLAIN) {
      logger.info(`Total ${data.length} milestone(s) in repository ${chalk.blue(repo)}:\n`);

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
  command: 'list [options]',
  aliases: ['ls'],
  description: 'List milestones of a repository.',
  builder,
  handler,
};
