/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const expect = require('chai').expect;
const chalk = require('chalk');
const debug = require('debug')('test:milestones:list');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { prepareCliCommand } = require('../utils');
const { createTestMilestone, deleteTestMilestone } = require('./utils');
const { GITHUB_TEST_REPO1, GITHUB_TEST_REPO2, GITHUB_TEST_REPO3, GITHUB_TEMPLATE_REPO } = require('../constants');

let milestoneCreated = [];

describe('should be able to sync milestone to all repositories', function() {
  after('delete all milestones created', async function() {
    for (let one of milestoneCreated) {
      debug(`Deleting ${chalk.blue(one[1])} from ${chalk.blue(one[0] || '(template)')}`);
      await deleteTestMilestone(one[0], one[1]);
    }
  });

  it('should be able to sync milestone to all repositories', async function() {
    // create test milestone
    const {
      milestone,
      create: resultCreate,
      list: resultList,
      delete: resultDelete,
    } = await createTestMilestone(null, null, null, null, true, false);
    milestoneCreated.push([null, milestone]);

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

    expect(resultDelete).to.be.undefined;

    // sync test milestone
    const resultSync = await exec(prepareCliCommand(['milestones', 'sync', milestone], true, false, true));

    debug('resultSync:', resultSync);

    expect(resultSync).to.have.property('stdout');
    expect(resultSync).to.have.property('stderr');

    expect(resultSync.stderr).to.be.empty;
    expect(resultSync.stdout).to.match(new RegExp('Total [0-9]+ repositories to sync:'));
    expect(resultSync.stdout).to.match(new RegExp(`- ${GITHUB_TEST_REPO1}: skipped`));
    expect(resultSync.stdout).to.match(new RegExp(`- ${GITHUB_TEST_REPO2}: created`));
    expect(resultSync.stdout).to.match(new RegExp(`- ${GITHUB_TEST_REPO3}: created`));

    const resultList1 = await exec(prepareCliCommand(['milestones', 'list', '--repository', GITHUB_TEST_REPO1], true, false, false));

    expect(resultList1).to.have.property('stdout');
    expect(resultList1).to.have.property('stderr');

    expect(resultList1.stderr).to.be.empty;
    expect(resultList1.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEST_REPO1}:`));
    expect(resultList1.stdout).to.match(new RegExp(`- #[0-9]+ ${milestone}:`));
    debug(`${milestone} is found in repository ${GITHUB_TEST_REPO1}`);

    const resultList2 = await exec(prepareCliCommand(['milestones', 'list', '--repository', GITHUB_TEST_REPO2], true, false, false));

    expect(resultList2).to.have.property('stdout');
    expect(resultList2).to.have.property('stderr');

    expect(resultList2.stderr).to.be.empty;
    expect(resultList2.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEST_REPO2}:`));
    expect(resultList2.stdout).to.match(new RegExp(`- #[0-9]+ ${milestone}:`));
    debug(`${milestone} is found in repository ${GITHUB_TEST_REPO2}`);

    const resultList3 = await exec(prepareCliCommand(['milestones', 'list', '--repository', GITHUB_TEST_REPO3], true, false, false));

    expect(resultList3).to.have.property('stdout');
    expect(resultList3).to.have.property('stderr');

    expect(resultList3.stderr).to.be.empty;
    expect(resultList3.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEST_REPO3}:`));
    expect(resultList3.stdout).to.match(new RegExp(`- #[0-9]+ ${milestone}:`));
    debug(`${milestone} is found in repository ${GITHUB_TEST_REPO3}`);
  });
});
