/*

winston란?
Logging을 돕는  라이브러리 심플하고 다중전송을 지원한다.
다중전송이란 예를 들어 오류 로그를 데이터베이스와 콘솔 또는 로컬 파일에 동시에 저장,
출력할 수 있는걸 말한다

winston-daily-rotate-file란?
로그들을 날짜, 사이즈에 기반해서 관리할 수 있게 도와주는 패키지


*/

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf ,colorize} = format;

const winstonDaily = require("winston-daily-rotate-file");

const myPrintFormat = printf(({ level, message, label, timestamp }) => {
    return `[${label}] [${timestamp}] [${level}]  ${message}`;
  });
  
let colorLogFormat = combine(
    colorize({
        all: true,
    }),
    label({
        label: "LOGGER",
    }),
    timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }),
    myPrintFormat
);

let basicLogFormat = combine(
    label({
        label: "LOGGER",
    }),
    timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }),
    myPrintFormat
);

const logger = createLogger({
    transports: [ 
        new transports.Console({ level: 'error', format: combine(colorLogFormat) }), 
        //new transports.Console({ level: 'info', format: combine(colorLogFormat) }), 
        new winstonDaily({
            level: 'info',
            filename: "logs/my_log",
            zippedArchive: true,
            maxSize: '10m',
            maxFiles: '2d',
            format: combine(basicLogFormat),
            }),
        new winstonDaily({
            level: 'error',
            filename: "logs/error/my_error_log",
            zippedArchive: true,
            maxSize: '10m',
            maxFiles: '7d',
            format: combine(basicLogFormat),
            }),
        ]
  });

  logger.add(new transports.Console({
    format: format.simple()
  }));
  //개발 상태 일때는 console.log()도 표시해주기 배포시
  //process.env.NODE_ENV  설정! - 나중엔 설정 // if (process.env.NODE_ENV !== 'production') {}
  
module.exports = logger;