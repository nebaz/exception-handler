let expect = require('chai').expect;
let ExceptionHandler = require('./../ExceptionHandler');
const {sleep} = require('usleep');
const fs = require('fs');


describe('/ExceptionHandler', async () => {

  let exceptionHandler = new ExceptionHandler();

  it('should save and read data from file', () => {
    let exceptionHandler = new ExceptionHandler();
    let input = {sleepTime: 100};
    exceptionHandler._saveExceptionData(input);
    let output = exceptionHandler._getExceptionData();

    expect(output).to.deep.equal(input);

    fs.unlinkSync('./lastRun.json');
  });


  it('should correctly increase timeout', () => {
    let startTime = new Date();
    let min = 0, step = 5, max = 10;
    let exceptionHandler = new ExceptionHandler(null, min, step, max);

    let sleepTime1 = exceptionHandler._calcSleepTime(new Date(startTime.getTime() + 1 * 1000));
    expect(sleepTime1).to.equal(0);

    let sleepTime2 = exceptionHandler._calcSleepTime(new Date(startTime.getTime() + 1 * 1000));
    expect(sleepTime2).to.equal(5);

    let sleepTime3 = exceptionHandler._calcSleepTime(new Date(startTime.getTime() + 1 * 1000));
    expect(sleepTime3).to.equal(10);

    let sleepTime4 = exceptionHandler._calcSleepTime(new Date(startTime.getTime() + 1 * 1000));
    expect(sleepTime4).to.equal(10);

    let sleepTime5 = exceptionHandler._calcSleepTime(new Date(startTime.getTime() + 3 * 1000));
    expect(sleepTime5).to.equal(0);

    fs.unlinkSync('./lastRun.json');
  });

  it('should correctly increase timeout after sleep', () => {
    let startTime = new Date();
    let min = 0, step = 30, max = 600;
    let exceptionHandler = new ExceptionHandler(null, min, step, max);

    let sleepTime1 = exceptionHandler._calcSleepTime(startTime);
    expect(sleepTime1).to.equal(0);

    let sleepTime2 = exceptionHandler._calcSleepTime(new Date(startTime.getTime() + 1 * 1000));
    expect(sleepTime2).to.equal(30);

    let sleepTime3 = exceptionHandler._calcSleepTime(new Date(startTime.getTime() + 1 * 1000));
    expect(sleepTime3).to.equal(60);

    let sleepTime4 = exceptionHandler._calcSleepTime(new Date(startTime.getTime() + 1 * 1000));
    expect(sleepTime4).to.equal(90);

    let sleepTime5 = exceptionHandler._calcSleepTime(new Date(startTime.getTime() + 1 * 1000));
    expect(sleepTime5).to.equal(120);

    let sleepTime6 = exceptionHandler._calcSleepTime(new Date(startTime.getTime() + 10 * 1000));
    expect(sleepTime6).to.equal(0);

    fs.unlinkSync('./lastRun.json');
  });

});
