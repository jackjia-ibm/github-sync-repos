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
const { GITHUB_TEST_REPO2, GITHUB_TEMPLATE_REPO } = require('../constants');

describe('should be able to list milestones of repository', function() {
  it('should return error if no repository is provided', async function() {
    let result;

    try {
      result = await exec(prepareCliCommand(['milestones', 'list'], true, false, false));
    } catch (err) {
      result = err;
    }

    debug('result:', result);

    expect(result).to.have.property('stdout');
    expect(result).to.have.property('stderr');

    expect(result.stderr).to.match(/Error: Repository is required\./);
  });

  it('should return label list of template repository without error', async function() {
    const result = await exec(prepareCliCommand(['milestones', 'list'], true, false, true));

    debug('result:', result);

    expect(result).to.have.property('stdout');
    expect(result).to.have.property('stderr');

    expect(result.stderr).to.be.empty;
    expect(result.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEMPLATE_REPO}:`));
  });

  it('should return label list of specified repository without error', async function() {
    const result = await exec(prepareCliCommand(['milestones', 'list', '--repository', GITHUB_TEST_REPO2], true, false, true));

    debug('result:', result);

    expect(result).to.have.property('stdout');
    expect(result).to.have.property('stderr');

    expect(result.stderr).to.be.empty;
    expect(result.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEST_REPO2}:`));
  });
});
