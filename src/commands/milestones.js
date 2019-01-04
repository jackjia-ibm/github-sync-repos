/**
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this
 * distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const builder = (yargs) => {
  return yargs.commandDir('milestones_commands').demandCommand().help();
};

module.exports = {
  command: 'milestones <command>',
  aliases: ['ms'],
  description: 'List/add/delete milestones of a repository.',
  builder,
};
