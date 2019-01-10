/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const expect = require('chai').expect;
const debug = require('debug')('test:options:help');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { prepareCliCommand } = require('../utils');
const { GSR_CLI_COMMAND } = require('../constants');

describe('should show different level of help messages', function() {
  it('should return top level help messages', async function() {
    const result = await exec(prepareCliCommand(['--help']));

    debug('result:', result);

    expect(result).to.have.property('stdout');
    expect(result).to.have.property('stderr');

    expect(result.stderr).to.be.empty;
    expect(result.stdout).to.match(new RegExp(`Usage: ${GSR_CLI_COMMAND}`));
    expect(result.stdout).to.include('Commands:');
  });

  it('should return milestones command help messages', async function() {
    const result = await exec(prepareCliCommand(['milestones', '--help']));

    debug('result:', result);

    expect(result).to.have.property('stdout');
    expect(result).to.have.property('stderr');

    expect(result.stderr).to.be.empty;
    expect(result.stdout).to.match(new RegExp(`${GSR_CLI_COMMAND} milestones `));
    expect(result.stdout).to.include('Commands:');
  });
});
