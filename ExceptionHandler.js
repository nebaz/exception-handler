const os = require('os');
const fs = require('fs');
const {sleep} = require('usleep');

const SLEEP_TIME_MIN_SECONDS_DEFAULT = 0;
const SLEEP_TIME_STEP_SECONDS_DEFAULT = 5;
const SLEEP_TIME_MAX_SECONDS_DEFAULT = 600;
const SLEEP_TIME_REFRESH_RATE = 50;
const LAST_EXCEPTION_DATA_FILENAME = 'lastRun.json';

class ExceptionHandler {

  constructor(transport = null, sleepTimeMin = SLEEP_TIME_MIN_SECONDS_DEFAULT, sleepTimeStep = SLEEP_TIME_STEP_SECONDS_DEFAULT, sleepTimeMax = SLEEP_TIME_MAX_SECONDS_DEFAULT) {
    this.transport = transport;
    this._setHandlers();
    this.sleepTimeMin = sleepTimeMin;
    this.sleepTimeStep = sleepTimeStep;
    this.sleepTimeMax = sleepTimeMax;
  }

  _setHandlers() {
    process.on('uncaughtException', error => this._catchException('Exception', error));
    process.on('unhandledRejection', reason => this._catchException('Rejection', reason));
  }

  async _catchException(type, error) {
    this.type = type;
    this.error = error;
    console.log('exception!');
    let errorTime = new Date();
    await this._notify(errorTime);
    await sleep(this._calcSleepTime(errorTime));
    process.exit();
  }

  async _notify(errorTime) {
    const hostname = os.hostname();

    console.error(errorTime.toLocaleString(), hostname, this.type, this.error);
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

    let exceptionData = this._getExceptionData();
    let timeDiff = Math.abs(Math.round(errorTime.getTime() / 1000) - exceptionData.lastErrorTime);

    let refreshRange = Math.ceil(this.sleepTimeStep * (SLEEP_TIME_REFRESH_RATE / 100));

    if (exceptionData.sleepTime - refreshRange < timeDiff && timeDiff < exceptionData.sleepTime + refreshRange) {
      if (exceptionData.sleepTime + this.sleepTimeStep <= this.sleepTimeMax) {
        exceptionData.sleepTime += this.sleepTimeStep;
      }
    } else if (timeDiff > exceptionData.sleepTime) {
      exceptionData = this._getDefaultExceptionData();
    }

    exceptionData.count += 1;
    this._saveExceptionData(exceptionData, errorTime);

    return exceptionData.sleepTime;
  }

  _getExceptionData() {
    try {
      let data = fs.readFileSync(LAST_EXCEPTION_DATA_FILENAME);
      return JSON.parse(data);
    } catch(e) {
      return this._getDefaultExceptionData();
    }
  }

  _saveExceptionData(data, errorTime) {
    data.lastErrorTime = Math.round(errorTime.getTime() / 1000);
    fs.writeFileSync(LAST_EXCEPTION_DATA_FILENAME, JSON.stringify(data));
  }

  _getDefaultExceptionData() {
    return {
      lastErrorTime: 0,
      count: 0,
      sleepTime: this.sleepTimeMin
    };
  }
}

module.exports = ExceptionHandler;
