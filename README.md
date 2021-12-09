# TC4400 Logparser
This node.js program is reading the SNMP Event Log (http://192.168.100.1/cmeventlog.html) from the Technicolor TC4400 broadband DOCSIS3.1 modem.

The messages from the TC4400 can be exported to a standard logfile and/or to a syslog.

## Requirements
* Running Node.js environment

## Usage
* getLog.js
Mainfile of the program (config is done here)

* Set this to false if output to logfile is disabled
* const logToLogfile = true;

* Path of the logfile and name (path=./logs and name=tc4400)
* const logPath = './logs/tc4400';

* Set this to false if output to syslog is disabled
* const logToSyslog = true;
* Additional config og syslog can be done in CustomLoggerSyslog.js (e.g. syslog host, port, protocol etc.)