# exception-handler 

# Use
#### add these lines to the beginning of the project:
    const ExceptionHandler = require('exception-handler');
    new ExceptionHandler(telegramConfig);
    
#### config

    token  - your telegram bot token
    adminChatId - telegram chat id for notify
    proxy - telegram proxy string if needed, e.q. http://login:password@ip:port 
    