const SECOND = 1000;
const MINUTE = 60*SECOND;
const HOUR = 60*MINUTE;


const SUNDAY = 0;
const MONDAY = 1;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const FRIDAY = 5;
const SATURDAY = 6;


/* a function for waiting around for some amount of time */
const sleep = (delayInMilliseconds) => new Promise(
  (res, rej) => setTimeout(res, delayInMilliseconds));


const today = () => (new Date()).getDay();


class Cooldown {
  constructor(args) {
    let callback;
    let time;
    let initiallyCold;

    if (typeof(args) === 'number') {
      callback = null;
      time = args;
      initiallyCold = true;
    } else {
      ({
        callback = null,
        time,
        initiallyCold = true
      } = args);
    }

    if (time === null || time === undefined) {
      throw new Error('missing required argument: time');
    }

    this.time = time;
    this.lastActivationTime = (
      initiallyCold ? null : (new Date()).getTime());
    this.callback = callback;
  }

  activate(args) {
    let callback;
    let force = false;

    if (args === null || args === undefined) {
      callback = this.callback;

    } else if (typeof(args) === 'function') {
      callback = args;

    } else {
      ({
        callback = this.callback,
        force = false
      } = args);
    }

    const actuallyActivate = (force || this.isCool());
    if (actuallyActivate) {
      this.lastActivationTime = (new Date()).getTime();
      if (callback) {
        callback();
      }
    }

    return actuallyActivate;
  }

  isCool() {
    return (
      this.lastActivationTime === null ||
      this.lastActivationTime === undefined ||
      this.time < ((new Date()).getTime() - this.lastActivationTime)
    );
  }

  getTimeToCooldown() {
    return (
      this.isCool()
        ? 0
        : this.lastActivationTime + this.time - (new Date()).getTime()
    );
  }

  async asPromise(activate=true) {
    const remainingTime = this.getTimeToCooldown();

    if (remainingTime) {
      await sleep(remainingTime);
    }

    if (activate) {
      this.activate();
    }
  }
};

module.exports = {
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,

  HOUR,
  MINUTE,
  SECOND,

  sleep,
  today,
  Cooldown
};
