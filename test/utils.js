/**
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this
 * distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const debug = require('debug')('test:utils');
const chalk = require('chalk');

const {
  GSR_CLI_COMMAND,
  GITHUB_SECRET_PASSWORD,
  GITHUB_SECRET_TOKEN,
  GITHUB_SECRET_USERNAME,
  GITHUB_TEMPLATE_REPO
} = require('./constants');

const prepareCliCommand = (args, useToken = false, usePassword = false, useTemplateRepo) => {
  const token = useToken ? ['--token', process.env[GITHUB_SECRET_TOKEN]] : [];
  const password = usePassword ? ['--username', process.env[GITHUB_SECRET_USERNAME],
    '--password', process.env[GITHUB_SECRET_PASSWORD]
  ] : [];
  const templateRepo = useTemplateRepo ? ['--template-repo', GITHUB_TEMPLATE_REPO] : [];

  const final = [
    GSR_CLI_COMMAND,
    ...token,
    ...password,
    ...templateRepo,
    ...args,
  ].join(' ');

  debug(`Command: ${chalk.blue(final)}`);

  return final;
};

module.exports = {
  prepareCliCommand,
};
