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
const { prepareCliCommand, getRandom } = require('../utils');
const { GITHUB_TEST_REPO2, GITHUB_TEMPLATE_REPO } = require('../constants');

describe('should be able to add milestone to repository', function() {
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

  it('should be able to create a milestone on template repository without error', async function() {
    let resultCreate, resultList;
    const milestone = `test-milestone-${getRandom(100000000, 999999999)}`;

    try {
      resultCreate = await exec(prepareCliCommand(['milestones', 'add', milestone], true, false, true));
    } catch (err) {
      // ignore error
      debug(`Failed to create milestone: ${err}`);
    } finally {
      // list milestones
      try {
        resultList = await exec(prepareCliCommand(['milestones', 'list'], true, false, true));
      } catch (err1) {
        debug(`Failed to list milestones: ${err1}`);
      }
      // delete the milestone created
      try {
        await exec(prepareCliCommand(['milestones', 'delete', milestone], true, false, true));
      } catch (err2) {
        debug(`Failed to delete milestone created: ${err2}`);
      }
    }

    debug('resultCreate:', resultCreate);
    debug('resultList:', resultList);

    expect(resultCreate).to.have.property('stdout');
    expect(resultCreate).to.have.property('stderr');

    expect(resultCreate.stderr).to.be.empty;
    expect(resultCreate.stdout).to.match(new RegExp(`"${milestone}" is created successfully.`));

    expect(resultList).to.have.property('stdout');
    expect(resultList).to.have.property('stderr');

    expect(resultList.stderr).to.be.empty;
    expect(resultList.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEMPLATE_REPO}:`));
    expect(resultList.stdout).to.match(new RegExp(`- #[0-9]+ ${milestone}:`));
  });

  it('should be able to create a milestone on a specific repository without error', async function() {
    let resultCreate, resultList;
    const milestone = `test-milestone-${getRandom(100000000, 999999999)}`;

    try {
      resultCreate = await exec(prepareCliCommand(['milestones', 'add', milestone, '--repository', GITHUB_TEST_REPO2], true, false, false));
    } catch (err) {
      // ignore error
      debug(`Failed to create milestone: ${err}`);
    } finally {
      // list milestones
      try {
        resultList = await exec(prepareCliCommand(['milestones', 'list', '--repository', GITHUB_TEST_REPO2], true, false, false));
      } catch (err1) {
        debug(`Failed to list milestones: ${err1}`);
      }
      // delete the milestone created
      try {
        await exec(prepareCliCommand(['milestones', 'delete', milestone, '--repository', GITHUB_TEST_REPO2], true, false, false));
      } catch (err2) {
        debug(`Failed to delete milestone created: ${err2}`);
      }
    }

    debug('resultCreate:', resultCreate);
    debug('resultList:', resultList);

    expect(resultCreate).to.have.property('stdout');
    expect(resultCreate).to.have.property('stderr');

    expect(resultCreate.stderr).to.be.empty;
    expect(resultCreate.stdout).to.match(new RegExp(`"${milestone}" is created successfully.`));

    expect(resultList).to.have.property('stdout');
    expect(resultList).to.have.property('stderr');

    expect(resultList.stderr).to.be.empty;
    expect(resultList.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEST_REPO2}:`));
    expect(resultList.stdout).to.match(new RegExp(`- #[0-9]+ ${milestone}:`));
  });
});
