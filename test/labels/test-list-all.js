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
const { GITHUB_TEST_REPO1, GITHUB_TEST_REPO2, GITHUB_TEST_REPO3 } = require('../constants');

describe('should be able to list labels of repository', function() {
  it('should return label list without error', async function() {
    const result = await exec(prepareCliCommand(['labels', 'list-all'], true, false, true));

    debug('result:', result);

    expect(result).to.have.property('stdout');
    expect(result).to.have.property('stderr');

    expect(result.stderr).to.be.empty;
    expect(result.stdout).to.match(new RegExp(`Total [0-9]+ label\\(s\\) in repository ${GITHUB_TEST_REPO1}:`));
    expect(result.stdout).to.match(new RegExp(`Total [0-9]+ label\\(s\\) in repository ${GITHUB_TEST_REPO2}:`));
    expect(result.stdout).to.match(new RegExp(`Total [0-9]+ label\\(s\\) in repository ${GITHUB_TEST_REPO3}:`));
  });
});
