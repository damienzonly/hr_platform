import winston from 'winston'

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    defaultMeta: { service: 'hr-server' },
    // format: winston.format.timestamp(),
    transports: [new winston.transports.Console()]
})