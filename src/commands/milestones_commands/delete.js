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
    .positional('milestone', {
      describe: 'Miletsone to delete. Can be miletsone ID or title.',
      type: 'string',
    })
    .options({
      repository: {
        alias: 'repo',
        description: 'Repository name. Delete milestone from this repository. Default value is the template repository.',
        group: 'Milestone Options',
      },
    });
};

const handler = async (options) => {
  const logger = options.logger;
  const gh = new GitHub(options);
  const repo = options.repository || options.templateRepo;
  if (!repo) {
    throw new Error('Repository is required.');
  }

  let id = options.milestone;
  let isId = true;
  if (!`${id}`.match(/^[0-9]+$/)) {
    const milestone = await gh.findMilesoneByTitle(repo, id);
    id = milestone.number;
    isId = false;
  }

  try {
    const data = await gh.deleteMilestoneById(repo, id);

    if (options.format === RESPONSE_FORMAT_JSON) {
      logger.info(JSON.stringify(data));
    } else if (options.format === RESPONSE_FORMAT_PLAIN) {
      if (isId) {
        logger.info(`Milestone #${chalk.blue(options.milestone)} is deleted successfully.`);
      } else {
        logger.info(`Milestone "${chalk.blue(options.milestone)}" is deleted successfully.`);
      }
    }
  } catch (err) {
    if (err && err.response && err.response.status && err.response.status === 404) {
      throw new Error(`Repository ${chalk.red(repo)} or milestone "${chalk.red(options.milestone)}" doesn't exist.`);
    } else {
      if (options.verbose) {
        logger.debug(err);
      }
      throw err;
    }
  }
};

module.exports = {
  command: 'delete <milestone> [options]',
  aliases: ['del', 'remove', 'rm'],
  description: 'Delete a milestone from repository.',
  builder,
  handler,
};
