const winston = require('winston');
require('winston-syslog');

class LoggerService {
    constructor() {
        this.log_data = null

        const logger = winston.createLogger({
            transports: [
                new winston.transports.Syslog({
                    host: 'syslog.home',
                    port: 51415,
                    protocol: 'udp4',
                    localhost: 'TC4400',
                    app_name: ''
                })
            ],
            format: winston.format.printf((info) => {
                    let message = `${info.message}`
                    return message
                })
        });
        this.logger = logger
    }
    setLogData(log_data) {
        this.log_data = log_data
    }
    info(message) {
        this.logger.log('info', message);
    }
    info(date, level, message) {
        console.log(date, level, message);
        this.logger.log('info', date + " | " + level + " | " + message)
    }
}

module.exports = LoggerService