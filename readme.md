# exception-handler 

### Use
Add these lines to the beginning of the project:

    const ExceptionHandler = require('exception-handler');
    new ExceptionHandler(transport, min, step, max);

### Parameters
**transport** - object. When it is not null - method send() will be invoked on exception.

**mix** - minimum sleep time. Default 0.

**step** - sleep time on next app's crash will be increased on this number. Default 5 seconds.

**max** - maximum sleep time. Default 600 seconds (2 minutes).

**minWorkTime** - minumum application work time before crash. Default 2 seconds.
