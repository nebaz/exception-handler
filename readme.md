# exception-handler 

# Use
#### add these lines to the beginning of the project:
    const ExceptionHandler = require('exception-handler');
    new ExceptionHandler(telegramConfig);

## config
* `token`  - your telegram bot token
* `chatId` - telegram chat id for notify
* `proxy` - telegram proxy string [optional], e.q. http://login:password@ip:port
