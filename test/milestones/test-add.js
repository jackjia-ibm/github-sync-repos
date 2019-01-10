/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const expect = require('chai').expect;
const debug = require('debug')('test:milestones:add');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { prepareCliCommand } = require('../utils');
const { createTestMilestone } = require('./utils');
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
    const {
      milestone,
      create: resultCreate,
      list: resultList,
      delete: resultDelete,
    } = await createTestMilestone();

    debug('resultCreate:', resultCreate);
    debug('resultList:', resultList);
    debug('resultDelete:', resultDelete);

    expect(resultCreate).to.have.property('stdout');
    expect(resultCreate).to.have.property('stderr');

    expect(resultCreate.stderr).to.be.empty;
    expect(resultCreate.stdout).to.match(new RegExp(`"${milestone}" is created successfully.`));

    expect(resultList).to.have.property('stdout');
    expect(resultList).to.have.property('stderr');

    expect(resultList.stderr).to.be.empty;
    expect(resultList.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEMPLATE_REPO}:`));
    expect(resultList.stdout).to.match(new RegExp(`- #[0-9]+ ${milestone}:`));

    expect(resultDelete).to.have.property('stdout');
    expect(resultDelete).to.have.property('stderr');

    expect(resultDelete.stderr).to.be.empty;
    expect(resultDelete.stdout).to.match(new RegExp(`"${milestone}" is deleted successfully.`));
  });

  it('should be able to create a milestone on a specific repository without error', async function() {
    const {
      milestone,
      create: resultCreate,
      list: resultList,
      delete: resultDelete,
    } = await createTestMilestone(GITHUB_TEST_REPO2);

    debug('resultCreate:', resultCreate);
    debug('resultList:', resultList);
    debug('resultDelete:', resultDelete);

    expect(resultCreate).to.have.property('stdout');
    expect(resultCreate).to.have.property('stderr');

    expect(resultCreate.stderr).to.be.empty;
    expect(resultCreate.stdout).to.match(new RegExp(`"${milestone}" is created successfully.`));

    expect(resultList).to.have.property('stdout');
    expect(resultList).to.have.property('stderr');

    expect(resultList.stderr).to.be.empty;
    expect(resultList.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEST_REPO2}:`));
    expect(resultList.stdout).to.match(new RegExp(`- #[0-9]+ ${milestone}:`));

    expect(resultDelete).to.have.property('stdout');
    expect(resultDelete).to.have.property('stderr');

    expect(resultDelete.stderr).to.be.empty;
    expect(resultDelete.stdout).to.match(new RegExp(`"${milestone}" is deleted successfully.`));
  });

  it('should be able to create a milestone with description and due date without error', async function() {
    let nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    nextYear = nextYear.toISOString().substr(0, 10);
    const description = 'test description';

    const {
      milestone,
      create: resultCreate,
      list: resultList,
      delete: resultDelete,
    } = await createTestMilestone(null, null, description, nextYear);

    debug('resultCreate:', resultCreate);
    debug('resultList:', resultList);
    debug('resultDelete:', resultDelete);

    expect(resultCreate).to.have.property('stdout');
    expect(resultCreate).to.have.property('stderr');

    expect(resultCreate.stderr).to.be.empty;
    expect(resultCreate.stdout).to.match(new RegExp(`"${milestone}" is created successfully.`));

    expect(resultList).to.have.property('stdout');
    expect(resultList).to.have.property('stderr');

    expect(resultList.stderr).to.be.empty;
    expect(resultList.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEMPLATE_REPO}:`));
    expect(resultList.stdout).to.match(new RegExp(`- #[0-9]+ ${milestone}: ${description}\\s+\\(📅 ${nextYear}T`));

    expect(resultDelete).to.have.property('stdout');
    expect(resultDelete).to.have.property('stderr');

    expect(resultDelete.stderr).to.be.empty;
    expect(resultDelete.stdout).to.match(new RegExp(`"${milestone}" is deleted successfully.`));
  });
});
