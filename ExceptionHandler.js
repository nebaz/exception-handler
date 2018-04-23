const Telegram = require(global._sdir + '/git_modules/telegram-notify');
const os = require('os');

class ExceptionHandler {

  constructor(telegramConfig) {
    this.telegram = new Telegram(telegramConfig);
    process.on('uncaughtException', error => this._catchException('Exception', error));
    process.on('unhandledRejection', reason => this._catchException('Rejection', reason));
  }

  async _catchException(type, error) {
    const hostname = os.hostname();
    console.error(new Date().toLocaleString(), hostname, type, error);
    await this.telegram.sendTelegram(hostname + ': ' + error.message);
    process.exit();
  }

}

module.exports = ExceptionHandler;