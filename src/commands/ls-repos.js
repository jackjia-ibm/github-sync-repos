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

const handler = async (options) => {
  const logger = options.logger;
  const gh = new GitHub(options);

  const data = await gh.listRepositories();

  if (options.format === RESPONSE_FORMAT_JSON) {
    logger.info(JSON.stringify(data));
  } else if (options.format === RESPONSE_FORMAT_PLAIN) {
    if (options.organization) {
      logger.info(`Total ${data.length} repositories in organization ${chalk.blue(options.organization)}:\n`);
    } else {
      const userProfile = await gh.getUserProfile();
      logger.info(`Total ${data.length} repositories in user ${chalk.blue(userProfile.login)}:\n`);
    }

    for (let one of data) {
      let isTemplate = '';
      if (one.name === options.templateRepo) {
        isTemplate = ' ' + chalk.green('<== template repository');
      }
      logger.info(` - ${one.name}${isTemplate}`);
    }
  }
};

module.exports = {
  description: 'List repositories of organization or user.',
  handler,
};
