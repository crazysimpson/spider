const log4js = require('log4js');

log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        app: { type: 'file', filename: 'spider.log' }
    },
    categories: {
        default: { appenders: ['out', 'app'], level: 'debug' }
    }
});

var logger = null;
function getLogger() {
    if (logger == null) {
        logger = log4js.getLogger('spider');
    }
    return logger;

}

exports.getLogger = getLogger;