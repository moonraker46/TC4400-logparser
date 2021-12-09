const playwright = require('playwright');
require('dotenv').config();

const storage = require('node-persist');

const { LocalDateTime, DateTimeFormatter } = require('@js-joda/core');
const { Locale } = require('@js-joda/locale');

// Set this to false if output to syslog is disabled
const logToSyslog = true;
// Set this to false if output to logfile is disabled
const logToLogfile = true;
// Path of the logfile and name (path=./logs and name=tc4400)
const logPath = './logs/tc4400';

const Logger = require('./CustomLogger');
const logger = new Logger(logPath);

const Syslogger = require('./CustomLoggerSyslog');

const getLastTimestamp = async () => {
    await storage.init({
        dir: 'persist',
        stringify: JSON.stringify,
        parse: JSON.parse,
        encoding: 'utf8',
        logging: false,
        ttl: false,
        expiredInterval: 2 * 60 * 1000,
        forgiveParseErrors: false
    });

    return storage.getItem("lastlog");

};

const setNewTimestamp = async () => {
    await storage.init({
        dir: 'persist',
        stringify: JSON.stringify,
        parse: JSON.parse,
        encoding: 'utf8',
        logging: false,
        ttl: false,
        expiredInterval: 2 * 60 * 1000,
        forgiveParseErrors: false
    });

    await storage.setItem("lastlog", LocalDateTime.now());

};

const getMessages = async () => {
    const browser = await playwright.chromium.launch({
        headless: true // Don't show the browser. 
    });

    // Create .env file with custom credentials, if not default login will be used
    const user = process.env.TC_USER || "admin";
    const password = process.env.TC_PASSWORD || "bEn2o#US9s";

    const page = await browser.newPage();

    try {
        await page.goto('http://' + user + ':' + password + '@192.168.100.1/cmeventlog.html');


        await page.waitForSelector("//html/body/blockquote/p/table", {
            timeout: 3000
        })
    } catch (err) {
        console.log("Connection to TC4400 not possible. Please check network connection (e.g. \"ping 192.168.100.1\") and login credentials.");
        await browser.close();
    }

    await page.locator('//html/body/blockquote/p/table').waitFor();

    const logs = await page.$eval('tbody', tableBody => {
        let allrows = [];
        for (let i = 0, row; row = tableBody.rows[i]; i++) {
            let logrow = [];
            for (let j = 0, col; col = row.cells[j]; j++) {
                logrow.push(row.cells[j].innerText);
            }
            allrows.push(logrow);
        }
        return allrows;

    });

    await browser.close();
    return logs;
};


getMessages()
    .then((res) => {

        // Sort array reverse
        res.reverse();
        res.forEach(element => {
            const df = DateTimeFormatter.ofPattern('EEE MMM d HH:mm:ss yyyy').withLocale(Locale.ENGLISH);
            let textdate = String(element[1]).trim();
            let logTimestamp = 'Mon Jan 1 00:00:00 0000';
            //let persistTimestampIso = LocalDateTime.parse(getLastTimestamp(), DateTimeFormatter.ISO_INSTANT);
            const formatter = DateTimeFormatter.ofPattern('MMM dd HH:mm:ss').withLocale(Locale.ENGLISH);

            getLastTimestamp()
                .then((res) => {
                    let persistTimestampIso = res;

                    if (textdate !== "undefined" && textdate !== "Time") {
                        let ts = LocalDateTime.parse(persistTimestampIso);//, DateTimeFormatter.ISO_LOCAL_DATE);
                        let tslog = LocalDateTime.parse(textdate, df);

                        if (tslog.isAfter(ts)) {
                            logTimestamp = LocalDateTime.parse(textdate, df).format(formatter);
                            if (logToLogfile) {
                                logger.info(logTimestamp, String(element[2]).trim(), element[3].replace('"', ''));
                            }
                            if (logToSyslog) {
                                const syslogger = new Syslogger();
                                syslogger.info(logTimestamp, String(element[2]).trim(), element[3].replace('"', ''));
                                syslogger.logger.close();
                            }
                        }
                    }
                    // Set new persist timestamp
                    (async = () => { setNewTimestamp() })();

                })
                .catch((res) => {
                    console.log(res);
                })

        });
    })
    .catch((res) => {
        console.log(res);
    })