const winston = require('winston');

const logger = winston.createLogger({

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(log => {
      return `${log.timestamp} | ${log.level}: ${log.message}`;
    })
  ),
  transports: [
    new winston.transports.Console({ colorize: true }),

    new winston.transports.File({
      level: 'error',
      colorize: false,
      json: false,
      maxsize: 5242880, // 5MB
      maxFiles: 15,
      filename: './logs/error.virie_blockexplorer.log',
      handleException: true
    }),
    new winston.transports.File({
      level: 'info',
      colorize: false,
      json: false,
      maxsize: 5242880, // 5MB
      maxFiles: 15,
      filename: './logs/info.virie-blockexplorer.log',
      handleException: true
    })
  ]
});

module.exports = logger;
