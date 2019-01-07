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
  const description = options.description;
  const dueOn = options.dueOn;
  const state = options.state;

  try {
    const data = await gh.createMilestone(repo, title, description, dueOn, state);

    if (options.format === RESPONSE_FORMAT_JSON) {
      logger.info(JSON.stringify(data));
    } else if (options.format === RESPONSE_FORMAT_PLAIN) {
      if (data.id) {
        logger.info(`"${chalk.blue(data.title)}" is created successfully.`);
      } else {
        throw new Error('Milestone is failed to create due to unknown failure.');
      }
    }
  } catch (err) {
    if (err && err.response && err.response.status && err.response.status === 404) {
      throw new Error(`Repository ${chalk.red(repo)} doesn't exist.`);
    } else if (err && err.response && err.response.status && err.response.status === 422 &&
      err.response.data) {
      let messages = [`${err.response.data.message}:`];
      for (let one of err.response.data.errors) {
        messages.push(JSON.stringify(one));
      }
      throw new Error(messages.join(' '));
    } else {
      throw err;
    }
  }
};

module.exports = {
  command: 'add <repository> <title> [description] [due-on] [state]',
  aliases: ['create'],
  description: 'Add milestone to a repository.',
  builder,
  handler,
};
