/* a function for waiting around for some amount of time */
const sleep = (delayInMilliseconds) => new Promise(
    (res, rej) => setTimeout(res, delayInMilliseconds));


class Cooldown {
  constructor(cooldownTime, callback=null) {
    this.cooldownTime = cooldownTime;
    this.lastTriggerTime = null;
    this.callback = callback;
  }

  trigger(skipIfHot=false) {
    if (skipIfHot && !this.isCool()) {
      return;
    }

    this.lastTriggerTime = (new Date()).getTime();
    if (this.callback) {
      this.callback();
    }
  }

  isCool() {
    return (
      this.lastTriggerTime === null ||
      this.lastTriggerTime === undefined ||
      this.cooldownTime < ((new Date()).getTime() - this.lastTriggerTime)
    );
  }

  getTimeToCooldown() {
    return (
      this.isCool()
        ? 0
        : this.lastTriggerTime + this.cooldownTime - (new Date()).getTime()
    );
  }

  async asPromise(doTrigger=true) {
    const remainingTime = this.getTimeToCooldown();

    if (remainingTime) {
      await sleep(remainingTime);
    }

    if (doTrigger) {
      this.trigger();
    }
  }
};

module.exports = {
  sleep,
  Cooldown
};
