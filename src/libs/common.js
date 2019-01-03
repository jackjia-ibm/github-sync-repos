/**
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this
 * distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const util = require('util');
const fs = require('fs');
const fsStat = util.promisify(fs.stat);

/**
 * Init an empty promise
 *
 * @return {Promise}
 */
const P = () => {
  return new Promise(resolve => {
    resolve();
  });
};

/**
 * Sleep for milliseconds
 *
 * @param  {Integer} ms   milliseconds
 * @return {Promise}
 */
const sleep = (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

/**
 * Get file/folder stat
 *
 * @param  {String} file file or folder path
 * @return {Object}      file system stat object
 */
const getFsStat = async(file) => {
  let st;

  try {
    st = await fsStat(file);
  } catch (e) {
    throw new Error(`"${file}" doesn't exist`);
  }

  return st;
};

module.exports = {
  P,
  sleep,

  getFsStat,
};
