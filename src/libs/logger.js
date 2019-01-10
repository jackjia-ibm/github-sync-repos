/**
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this
 * distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const winston = require('winston');
const path = require('path');

const createLogger = (level, file) => {
  let transports = [];

  transports.push(new winston.transports.Console({
    stderrLevels: ['error'],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.splat(),
      winston.format.printf(info => {
        const lvl = info.level.indexOf('info') > -1 ? '' : `[${info.level}]: `;
        return `${lvl}${info.message}`;
      })
    ),
  }));

  if (file) {
    transports.push(new winston.transports.File({
      filename: path.join(__dirname, `../../logs/${file}`),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.printf(info => {
          return `${info.timestamp} ${info.level}: ${info.message}`;
        })
      ),
    }));
  }

  return winston.createLogger({
    level,
    transports,
  });
};

module.exports = createLogger;
