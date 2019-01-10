/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const expect = require('chai').expect;
const chalk = require('chalk');
const debug = require('debug')('test:milestones:edit');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { prepareCliCommand, getRandom } = require('../utils');
const { createTestMilestone, deleteTestMilestone } = require('./utils');
const { GITHUB_TEST_REPO2, GITHUB_TEMPLATE_REPO } = require('../constants');

let milestoneCreated = [];

describe('should be able to edit milestone of a repository', function() {
  after('delete all milestones created', async function() {
    for (let one of milestoneCreated) {
      debug(`Deleting ${chalk.blue(one[1])} from ${chalk.blue(one[0] || '(template)')}`);
      await deleteTestMilestone(one[0], one[1]);
    }
  });

  it('should be able to edit milestone on template repository without error', async function() {
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

    // update test milestone
    const newTitle = `test-milestone-${getRandom(100000000, 999999999)}`;
    const resultEdit = await exec(prepareCliCommand(['milestones', 'edit', milestone, '--title', newTitle], true, false, true));
    milestoneCreated.push([null, newTitle]);

    debug('resultEdit:', resultEdit);

    expect(resultEdit).to.have.property('stdout');
    expect(resultEdit).to.have.property('stderr');

    expect(resultEdit.stderr).to.be.empty;
    expect(resultEdit.stdout).to.match(new RegExp(`"${newTitle}" is updated successfully.`));

    const resultListAfter = await exec(prepareCliCommand(['milestones', 'list'], true, false, true));

    expect(resultListAfter).to.have.property('stdout');
    expect(resultListAfter).to.have.property('stderr');

    expect(resultListAfter.stderr).to.be.empty;
    expect(resultListAfter.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEMPLATE_REPO}:`));
    expect(resultListAfter.stdout).to.match(new RegExp(`- #[0-9]+ ${newTitle}:`));
    expect(resultListAfter.stdout).to.not.match(new RegExp(`- #[0-9]+ ${milestone}:`));
  });

  it('should be able to edit milestone on a specific repository without error', async function() {
    // create test milestone
    const {
      milestone,
      create: resultCreate,
      list: resultList,
      delete: resultDelete,
    } = await createTestMilestone(GITHUB_TEST_REPO2, null, null, null, true, false);
    milestoneCreated.push([GITHUB_TEST_REPO2, milestone]);

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

    expect(resultDelete).to.be.undefined;

    // update test milestone
    const newTitle = `test-milestone-${getRandom(100000000, 999999999)}`;
    const resultEdit = await exec(prepareCliCommand(['milestones', 'edit', milestone, '--repository', GITHUB_TEST_REPO2, '--title', newTitle], true, false, false));
    milestoneCreated.push([GITHUB_TEST_REPO2, newTitle]);

    debug('resultEdit:', resultEdit);

    expect(resultEdit).to.have.property('stdout');
    expect(resultEdit).to.have.property('stderr');

    expect(resultEdit.stderr).to.be.empty;
    expect(resultEdit.stdout).to.match(new RegExp(`"${newTitle}" is updated successfully.`));

    const resultListAfter = await exec(prepareCliCommand(['milestones', 'list', '--repository', GITHUB_TEST_REPO2], true, false, false));

    expect(resultListAfter).to.have.property('stdout');
    expect(resultListAfter).to.have.property('stderr');

    expect(resultListAfter.stderr).to.be.empty;
    expect(resultListAfter.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEST_REPO2}:`));
    expect(resultListAfter.stdout).to.match(new RegExp(`- #[0-9]+ ${newTitle}:`));
    expect(resultListAfter.stdout).to.not.match(new RegExp(`- #[0-9]+ ${milestone}:`));
  });

  it('should be able to edit milestone description and due date without error', async function() {
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

    // update test milestone
    let nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    nextYear = nextYear.toISOString().substr(0, 10);
    const description = 'test description';
    const resultEdit = await exec(prepareCliCommand(['milestones', 'edit', milestone,
      '--description', description,
      '--due-on', nextYear,
    ], true, false, true));

    debug('resultEdit:', resultEdit);

    expect(resultEdit).to.have.property('stdout');
    expect(resultEdit).to.have.property('stderr');

    expect(resultEdit.stderr).to.be.empty;
    expect(resultEdit.stdout).to.match(new RegExp(`"${milestone}" is updated successfully.`));

    const resultListAfter = await exec(prepareCliCommand(['milestones', 'list'], true, false, true));

    expect(resultListAfter).to.have.property('stdout');
    expect(resultListAfter).to.have.property('stderr');

    expect(resultListAfter.stderr).to.be.empty;
    expect(resultListAfter.stdout).to.match(new RegExp(`Total [0-9]+ milestone\\(s\\) in repository ${GITHUB_TEMPLATE_REPO}:`));
    expect(resultListAfter.stdout).to.match(new RegExp(`- #[0-9]+ ${milestone}: ${description}\\s+\\(📅 ${nextYear}T`));
  });
});
