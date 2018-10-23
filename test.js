let ExceptionHandler = require('./ExceptionHandler');
new ExceptionHandler({ send: (message) => console.log(message) });

/**
 * Change workTimeMs to test exception handler
 */
let workTimeMs = 1000;


setTimeout(() => { throw new Error }, workTimeMs);
