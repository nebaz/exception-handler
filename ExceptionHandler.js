const os = require('os');
const fs = require('fs');
const {sleep} = require('usleep');

const SLEEP_TIME_MIN_SECONDS_DEFAULT = 0;
const SLEEP_TIME_STEP_SECONDS_DEFAULT = 5;
const SLEEP_TIME_MAX_SECONDS_DEFAULT = 600;
const APP_MIN_WORK_TIME_SECONDS = 2;
const LAST_EXCEPTION_DATA_FILENAME = 'lastRun.json';

class ExceptionHandler {

  constructor(
    transport = null,
    sleepTimeMin = SLEEP_TIME_MIN_SECONDS_DEFAULT,
    sleepTimeStep = SLEEP_TIME_STEP_SECONDS_DEFAULT,
    sleepTimeMax = SLEEP_TIME_MAX_SECONDS_DEFAULT,
    minWorkTime = APP_MIN_WORK_TIME_SECONDS
  ) {
    this.appStartTime = new Date();
    this.transport = transport;
    this._setHandlers();
    this.sleepTimeMin = sleepTimeMin;
    this.sleepTimeStep = sleepTimeStep;
    this.sleepTimeMax = sleepTimeMax;
    this.minWorkTime = minWorkTime;
  }

  _setHandlers() {
    process.on('uncaughtException', error => this._catchException('Exception', error));
    process.on('unhandledRejection', reason => this._catchException('Rejection', reason));
  }

  async _catchException(type, error) {
    let errorTime = new Date();
    await this._notify(errorTime, type, error);
    await sleep(this._calcSleepTime(errorTime));
    process.exit();
  }

  async _notify(errorTime, type, error) {
    const hostname = os.hostname();

    console.error(errorTime.toLocaleString(), hostname, type, error);
    if (this.transport) {
      await this.transport.send(hostname + ': ' + error.message);
    }
  }

  _calcSleepTime(errorTime) {
    if (this.sleepTimeStep === 0) {
      return this.sleepTimeMin;
    }
    if (this.sleepTimeMin === this.sleepTimeMax) {
      return this.sleepTimeMin;
    }
    if (this.sleepTimeMin > this.sleepTimeMax) {
      return this.sleepTimeMin;
    }

    let exception = this._getExceptionData();

    let appWorkTime = errorTime.getTime() / 1000 - this.appStartTime.getTime() / 1000;
    if (appWorkTime < this.minWorkTime) {
      if (exception.count > 0 && exception.sleepTime + this.sleepTimeStep <= this.sleepTimeMax) {
        exception.sleepTime += this.sleepTimeStep;
      }
    } else {
      exception = this._getDefaultExceptionData();
    }

    exception.count += 1;
    this._saveExceptionData(exception);

    return exception.sleepTime;
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
}

module.exports = ExceptionHandler;
