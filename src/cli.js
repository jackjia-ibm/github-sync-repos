#!/usr/bin/env node

/**
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this
 * distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

// load tool version
const pkg = require('../package.json');
const version = pkg && pkg.version;

// parse arguments
const yargs = require('yargs');
const argv = yargs
  .version(version)
  .scriptName('gls')
  .usage('Usage: $0 <command> [options]')
  .demandCommand()
  .help()
  .alias('h', 'help')
  .parse();

// validate command argv
const command = argv && argv._ && argv._[0];
if (!command) {
  yargs.showHelp();
  process.exit(1);
}

process.stdout.write(`command: ${command}`);
