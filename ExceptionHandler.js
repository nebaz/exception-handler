const Telegram = require(global._sdir + '/git_modules/telegram-notify');

class ExceptionHandler {

  constructor(telegramToken, telegramAdminChatId) {
    this.telegram = new Telegram(telegramToken, telegramAdminChatId);
    process.on('uncaughtException', error => this._catchException('Exception', error));
    process.on('unhandledRejection', reason => this._catchException('Rejection', reason));
  }

  async _catchException(type, error) {
    console.error(new Date().toLocaleString(), type, error);
    await this.telegram.sendTelegram(type + ': ' + error.message);
    process.exit();
  }

}

module.exports = ExceptionHandler;