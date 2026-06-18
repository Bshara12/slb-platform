
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  data?: unknown;
}

function log(level: LogLevel, message: string, data?: unknown): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'load-balancer',
    message,
    ...(data !== undefined && { data }),
  };


  const color = {
    info:  '\x1b[36m',  
    warn:  '\x1b[33m',  
    error: '\x1b[31m',  
    debug: '\x1b[90m',  
  }[level];

  const reset = '\x1b[0m';
  const prefix = `${color}[${entry.level.toUpperCase()}]${reset}`;
  const time = `\x1b[90m${entry.timestamp}\x1b[0m`;

  if (data !== undefined) {
    console.log(`${time} ${prefix} ${message}`, data);
  } else {
    console.log(`${time} ${prefix} ${message}`);
  }
}

export const logger = {
  info:  (msg: string, data?: unknown) => log('info',  msg, data),
  warn:  (msg: string, data?: unknown) => log('warn',  msg, data),
  error: (msg: string, data?: unknown) => log('error', msg, data),
  debug: (msg: string, data?: unknown) => log('debug', msg, data),
};