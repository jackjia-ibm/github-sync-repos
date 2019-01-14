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
const { prepareCliCommand, getRandom, } = require('../utils');
const { createTestMilestone, deleteTestMilestoneFromAll } = require('./utils');
const { GITHUB_TEST_REPO1, GITHUB_TEST_REPO2, GITHUB_TEST_REPO3, GITHUB_TEMPLATE_REPO } = require('../constants');

let milestoneCreated = [];

describe('should be able to update milestone from all repositories', function() {
  after('delete all milestones created', async function() {
    for (let one of milestoneCreated) {
      debug(`Deleting ${chalk.blue(one)} ...`);
      await deleteTestMilestoneFromAll(one);
    }
  });

  it('should be able to edit milestones from all repositories', async function() {
    const testMilestoneTitle = `test-milestone-${getRandom(100000000, 999999999)}`;
    const testMilestoneNewTitle = `updated-milestone-${getRandom(100000000, 999999999)}`;
    milestoneCreated.push(testMilestoneTitle);
    milestoneCreated.push(testMilestoneNewTitle);

    // create test milestone on test1
    const {
      create: resultCreate1,
      list: resultList1,
      delete: resultDelete1,
    } = await createTestMilestone(null, testMilestoneTitle, null, null, true, false);

    debug('resultCreate1:', resultCreate1);
    debug('resultList1:', resultList1);
    debug('resultDelete1:', resultDelete1);

    expect(resultCreate1).to.have.property('stdout');
    expect(resultCreate1).to.have.property('stderr');

    expect(resultCreate1.stderr).to.be.empty;
    expect(resultCreate1.stdout).to.match(new RegExp(`"${testMilestoneTitle}" is created successfully.`));

    expect(resultList1).to.have.property('stdout');
    expect(resultList1).to.have.property('stderr');

    expect(resultList1.stderr).to.be.empty;
    expect(resultList1.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEMPLATE_REPO}:`));
    expect(resultList1.stdout).to.match(new RegExp(`- #[0-9]+ ${testMilestoneTitle}:`));

    expect(resultDelete1).to.be.undefined;

    // create test milestone on test2
    const {
      create: resultCreate2,
      list: resultList2,
      delete: resultDelete2,
    } = await createTestMilestone(GITHUB_TEST_REPO2, testMilestoneTitle, null, null, true, false);

    debug('resultCreate2:', resultCreate2);
    debug('resultList2:', resultList2);
    debug('resultDelete2:', resultDelete2);

    expect(resultCreate2).to.have.property('stdout');
    expect(resultCreate2).to.have.property('stderr');

    expect(resultCreate2.stderr).to.be.empty;
    expect(resultCreate2.stdout).to.match(new RegExp(`"${testMilestoneTitle}" is created successfully.`));

    expect(resultList2).to.have.property('stdout');
    expect(resultList2).to.have.property('stderr');

    expect(resultList2.stderr).to.be.empty;
    expect(resultList2.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEST_REPO2}:`));
    expect(resultList2.stdout).to.match(new RegExp(`- #[0-9]+ ${testMilestoneTitle}:`));

    expect(resultDelete2).to.be.undefined;

    // edit from all test milestone
    const resultEditAll = await exec(prepareCliCommand(['milestones', 'edit-all', testMilestoneTitle, '--title', testMilestoneNewTitle], true, false, true));

    debug('resultEditAll:', resultEditAll);

    expect(resultEditAll).to.have.property('stdout');
    expect(resultEditAll).to.have.property('stderr');

    expect(resultEditAll.stderr).to.be.empty;
    expect(resultEditAll.stdout).to.match(new RegExp(`Updating milestone "${testMilestoneTitle}" from [0-9]+ repositories:`));
    expect(resultEditAll.stdout).to.match(new RegExp(`- ${GITHUB_TEST_REPO1}: success`));
    expect(resultEditAll.stdout).to.match(new RegExp(`- ${GITHUB_TEST_REPO2}: success`));
    expect(resultEditAll.stdout).to.match(new RegExp(`- ${GITHUB_TEST_REPO3}: doesn't exist`));

    const resultList1Updated = await exec(prepareCliCommand(['milestones', 'list', '--repository', GITHUB_TEST_REPO1], true, false, false));

    expect(resultList1Updated).to.have.property('stdout');
    expect(resultList1Updated).to.have.property('stderr');

    expect(resultList1Updated.stderr).to.be.empty;
    expect(resultList1Updated.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEST_REPO1}:`));
    expect(resultList1Updated.stdout).to.match(new RegExp(`- #[0-9]+ ${testMilestoneNewTitle}:`));
    debug(`${testMilestoneNewTitle} is found in repository ${GITHUB_TEST_REPO1}`);

    const resultList2Updated = await exec(prepareCliCommand(['milestones', 'list', '--repository', GITHUB_TEST_REPO2], true, false, false));

    expect(resultList2Updated).to.have.property('stdout');
    expect(resultList2Updated).to.have.property('stderr');

    expect(resultList2Updated.stderr).to.be.empty;
    expect(resultList2Updated.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEST_REPO2}:`));
    expect(resultList2Updated.stdout).to.match(new RegExp(`- #[0-9]+ ${testMilestoneNewTitle}:`));
    debug(`${testMilestoneNewTitle} is found in repository ${GITHUB_TEST_REPO2}`);

    const resultList3Updated = await exec(prepareCliCommand(['milestones', 'list', '--repository', GITHUB_TEST_REPO3], true, false, false));

    expect(resultList3Updated).to.have.property('stdout');
    expect(resultList3Updated).to.have.property('stderr');

    expect(resultList3Updated.stderr).to.be.empty;
    expect(resultList3Updated.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEST_REPO3}:`));
    expect(resultList3Updated.stdout).to.not.match(new RegExp(`- #[0-9]+ ${testMilestoneNewTitle}:`));
    debug(`${testMilestoneNewTitle} is not found in repository ${GITHUB_TEST_REPO3} (as expected)`);
  });
});
