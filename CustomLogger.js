const winston = require('winston')

dateFormat = () => {
    return new Date(Date.now()).toUTCString()
}
class LoggerService {
    constructor(route) {
        this.log_data = null
        this.route = route

        const logger = winston.createLogger({
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({
                    filename: `${route}.log`
                })
            ],
            format: winston.format.printf((info) => {
                let message =  `${info.message}`
                return message
            })
        });
        this.logger = logger
    }
    setLogData(log_data) {
        this.log_data = log_data
    }
    async info(message) {
        this.logger.log('info', message);
    }
    async info(date, level , message) {
        this.logger.log('info', date + " | " + level + " | " +  message)
    }
}
module.exports = LoggerService