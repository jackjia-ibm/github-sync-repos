#!/usr/bin/env node

/**
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this
 * distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const chalk = require('chalk');

// load tool version
const pkg = require('../package.json');
const version = pkg && pkg.version;
const name = pkg && pkg.name;
const { RESPONSE_FORMATS, RESPONSE_DEFAULT_FORMAT, RESPONSE_FORMAT_PLAIN } = require('./libs/constants');
require('dotenv').config();

let logger;
const startLogging = argv => {
  // init logger
  logger = require('./libs/logger')(argv.verbose ? 'debug' : 'info');
  if (argv.format === RESPONSE_FORMAT_PLAIN) {
    logger.info('=============================================================================================');
    logger.info(`${name} v${version}`);
    logger.info('');
    logger.debug('argv: %j', argv);
  }

  argv.logger = logger;
};

// parse arguments
const yargs = require('yargs');
yargs
  .version(version)
  .scriptName('gsr')
  .env('GSR')
  .commandDir('commands')
  .demandCommand()
  .usage('Usage: $0 [options] <command> [command-options]')
  .config()
  .options({
    organization: {
      description: 'Github organization name.',
      group: 'GitHub:',
    },
    'template-repo': {
      description: 'Github template repository name.',
      group: 'GitHub:',
    },
    username: {
      alias: 'u',
      description: 'Github account username. Required if API token is empty.',
      implies: 'password',
      group: 'GitHub:',
    },
    password: {
      alias: 'p',
      description: 'Github account password. Required if API token is empty.',
      group: 'GitHub:',
    },
    token: {
      description: 'Github API token. Required if username is empty.',
      group: 'GitHub:',
    },
    format: {
      default: RESPONSE_DEFAULT_FORMAT,
      description: `Response format. Available values are: ${RESPONSE_FORMATS.join(', ')}.`,
    },
    verbose: {
      alias: 'v',
      default: false,
      description: 'Show more processing details.',
      type: 'boolean',
    }
  })
  .demandCommand()
  .help()
  .alias('h', 'help')
  .middleware([startLogging])
  .fail((msg, err) => {
    const l = logger || console;
    if (msg) {
      l.error(msg);
    }
    if (err) {
      l.error(`${err}`);
    }
    l.error(chalk `Try {green --help} to get usage information, or use {green --verbose} option to display more details.`);
    process.exit(1);
  })
  .parse();
