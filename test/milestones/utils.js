/**
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this
 * distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const debug = require('debug')('test:milestones:utils');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const chalk = require('chalk');
const { prepareCliCommand, getRandom } = require('../utils');

const createTestMilestone = async (repository = null,
  title = null, description = null, dueOn = null,
  allowList = true, allowDelete = true) => {
  let extraCreateParams = [],
    extraListParams = [],
    useTemplateRepo = true;
  let resultCreate, resultList, resultDelete;
  const milestone = title || `test-milestone-${getRandom(100000000, 999999999)}`;

  if (repository) {
    extraCreateParams.push('--repository');
    extraCreateParams.push(repository);
    extraListParams.push('--repository');
    extraListParams.push(repository);
    useTemplateRepo = false;
  }
  if (description) {
    extraCreateParams.push('--description');
    extraCreateParams.push(description);
  }
  if (dueOn) {
    extraCreateParams.push('--due-on');
    extraCreateParams.push(dueOn);
  }

  try {
    resultCreate = await exec(prepareCliCommand(['milestones', 'add', milestone, ...extraCreateParams], true, false, useTemplateRepo));
    debug(`Milestone ${chalk.blue(milestone)} is created.`);
  } catch (err) {
    // ignore error
    resultCreate = err;
    debug(`Failed to create milestone: ${err}`);
  } finally {
    if (allowList) {
      // list milestones
      try {
        resultList = await exec(prepareCliCommand(['milestones', 'list', ...extraListParams], true, false, useTemplateRepo));
      } catch (err1) {
        resultList = err1;
        debug(`Failed to list milestones: ${err1}`);
      }
    }
    if (allowDelete) {
      // delete the milestone created
      resultDelete = await deleteTestMilestone(repository, milestone);
    }
  }

  return {
    milestone,
    create: resultCreate,
    list: resultList,
    delete: resultDelete,
  };
};

const deleteTestMilestone = async (repository = null, title = null) => {
  let resultDelete;
  let extraDeleteParams = [],
    useTemplateRepo = true;
  if (repository) {
    extraDeleteParams.push('--repository');
    extraDeleteParams.push(repository);
    useTemplateRepo = false;
  }
  if (!title) {
    throw new Error('Milestone is required.');
  }

  // delete the milestone created
  try {
    resultDelete = await exec(prepareCliCommand(['milestones', 'delete', title, ...extraDeleteParams], true, false, useTemplateRepo));
    debug(`Milestone ${chalk.blue(title)} is deleted.`);
  } catch (err) {
    resultDelete = err;
    debug(`Failed to delete milestone created: ${err}`);
  }

  return resultDelete;
};

module.exports = {
  createTestMilestone,
  deleteTestMilestone,
};
