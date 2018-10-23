const os = require('os');
const fs = require('fs');
const { sleep } = require('usleep');

const SLEEP_TIME_MIN_SECONDS_DEFAULT = 0;
const SLEEP_TIME_STEP_SECONDS_DEFAULT = 2;
const SLEEP_TIME_MAX_SECONDS_DEFAULT = 600;
const APP_MIN_WORK_TIME_SECONDS = 2;
const LAST_EXCEPTION_DATA_FILENAME = 'lastRun.json';

class ExceptionHandler {

  constructor(
    transport = null,
    sleepTimeMin = SLEEP_TIME_MIN_SECONDS_DEFAULT,
    sleepTimeBase = SLEEP_TIME_STEP_SECONDS_DEFAULT,
    sleepTimeMax = SLEEP_TIME_MAX_SECONDS_DEFAULT,
    minWorkTime = APP_MIN_WORK_TIME_SECONDS
  ) {
    this.transport = transport;
    this.sleepTimeMin = sleepTimeMin;
    this.sleepTimeBase = sleepTimeBase;
    this.sleepTimeMax = sleepTimeMax;
    this.minWorkTime = minWorkTime;

    this._setHandlers();

    this.timerId = setTimeout(this._removeExceptionData, this.minWorkTime * 1000);
  }

  _setHandlers() {
    process.on('uncaughtException', error => this._catchException('Exception', error));
    process.on('unhandledRejection', reason => this._catchException('Rejection', reason));
  }

  async _catchException(type, error) {
    clearTimeout(this.timerId);
    await this._notify(type, error);

    await sleep(this._getSleepTime());
    process.exit();
  }

  async _notify(type, error) {
    const hostname = os.hostname();
    const errorTime = new Date();

    console.error(errorTime.toLocaleString(), hostname, type, error);
    if (this.transport) {
      await this.transport.send(hostname + ': ' + error.message);
    }
  }

  _getSleepTime() {
    if (this.sleepTimeMin === this.sleepTimeMax) {
      return this.sleepTimeMin;
    }
    if (this.sleepTimeMin > this.sleepTimeMax) {
      return this.sleepTimeMin;
    }

    let exception = this._getExceptionData();
    let sleepTime = this._calcSleepTime(exception.count);

    if (exception.count > 0 && sleepTime <= this.sleepTimeMax) {
      exception.sleepTime = sleepTime;
    }

    exception.count += 1;
    this._saveExceptionData(exception);

    return exception.sleepTime;
  }

  _calcSleepTime(occurenceCount) {
    return Math.pow(this.sleepTimeBase, occurenceCount);
  }

  _getExceptionData() {
    try {
      let data = fs.readFileSync(LAST_EXCEPTION_DATA_FILENAME);
      return JSON.parse(data);
    } catch (e) {
      return this._getDefaultExceptionData();
    }
  }

  _saveExceptionData(data) {
    fs.writeFileSync(LAST_EXCEPTION_DATA_FILENAME, JSON.stringify(data));
  }

  _getDefaultExceptionData() {
    return {
      sleepTime: 0,
      count: 0
    };
  }

  _removeExceptionData() {
    fs.unlinkSync(LAST_EXCEPTION_DATA_FILENAME);
  }
}

module.exports = ExceptionHandler;
