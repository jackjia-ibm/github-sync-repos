/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const expect = require('chai').expect;
const debug = require('debug')('test:options:token');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { prepareCliCommand } = require('../utils');
const { GITHUB_TEST_REPO1 } = require('../constants');

describe('should accept token or username/password to login', function() {
  it('should return repository list without error with supplied token', async function() {
    const result = await exec(prepareCliCommand(['repo', 'ls'], true));

    debug('result:', result);

    expect(result).to.have.property('stdout');
    expect(result).to.have.property('stderr');

    expect(result.stderr).to.be.empty;
    expect(result.stdout).to.match(/Total [0-9]+ repositories in user/);
    expect(result.stdout).to.include(`- ${GITHUB_TEST_REPO1}\n`);
  });

  it('should return repository list without error with supplied username/password', async function() {
    const result = await exec(prepareCliCommand(['repo', 'ls'], false, true));

    debug('result:', result);

    expect(result).to.have.property('stdout');
    expect(result).to.have.property('stderr');

    expect(result.stderr).to.be.empty;
    expect(result.stdout).to.match(/Total [0-9]+ repositories in user/);
    expect(result.stdout).to.include(`- ${GITHUB_TEST_REPO1}\n`);
  });
});
