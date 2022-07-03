import log4js from 'log4js';

log4js.configure({
    appenders:{
        loggerFileError: { type: 'file', filename: 'logs/error.log'},
        loggerFileWarning: { type: 'file', filename: 'logs/warn.log'},
        loggerConsole:  { type: 'console'}
    },
    categories:{
        default: {appenders:['loggerConsole'], level: 'info' },
        fileError: {appenders:['loggerFileWarning'], level: 'error' },
        fileWarning: {appenders:['loggerFileWarning'], level: 'warn' }
    }
})

export default log4js