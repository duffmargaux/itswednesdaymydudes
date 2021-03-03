
const chronos = require('./chronos');

const checkPresence = async (channel) => {
  let i, members = channel.members.array();
  let n = members.length;
  for (i=0; i<n; ++i) {
    let member = members[i];
    if (member.voice.deaf) {
      continue;
    }

    return true;
  }

  return false;
};


const DELAY = 3*chronos.SECONDS;


class Voyeur {
  constructor(channel, autoJoin=true) {
    this.channel = channel;
    this.autoJoin = autoJoin;
    this.someonePresent = checkPresence(this.channel);
    this.presenceCBPromise = null;
    this.exodusCBPromise = null;
  }


  _callPresenceCB(cb) {
    if (this.presenceCBPromise) {
      return;
    }

    this.presenceCBPromise = chronos.sleep(DELAY).then(async () => {
      let connection = null;

      if (this.autoJoin) {
        connection = await this.channel.join();
      }

      cb(this.channel, connection);
      this.presenceCBPromise = null;
    });
  }


  _callExodusCB(cb) {
    if (this.exodusCBPromise) {
      return;
    }

    this.exodusCBPromise = chronos.sleep(DELAY).then(async () => {
      cb();
      if (this.autoJoin) {
        this.channel.leave();
      }
      this.presenceCBPromise = null;
    });
  }


  onPresence(cb) {
    if (!this.someonePresent) {
      this.someonePresent = checkPresence(this.channel);
    }

    this.someonePresent.then((isPresent) => {
      if (isPresent) {
        this._callPresenceCB(cb);
        return;
      }

      this.channel.client.on('voiceStateUpdate', (oldState, newState) => {
        console.log('VOICE STATE UPDATE (PRESENCE)');
        console.log(oldState);
        console.log(newState);
        if (
          (newState.channel === this.channel && !newState.deaf) &&
          (
            oldState.channel !== newState.channel ||
            oldState.deaf !== newState.deaf
          )
        ) {
          this._callPresenceCB(cb);
        }
      });
    });
  }


  onExodus(cb) {
    this.channel.client.on('voiceStateUpdate', (oldState, newState) => {
        console.log('VOICE STATE UPDATE (EXODUS)');
        console.log(oldState);
        console.log(newState);

      let userInChannelLeft = (
        oldState.channel === this.channel &&
        newState.channel !== this.channel &&
        !oldState.deaf
      );

      let userInChannelDeafened = (
        oldState.channel === this.channel &&
        newState.channel === this.channel &&
        !oldState.deaf &&
        newState.deaf
      );

      if (userInChannelLeft || userInChannelDeafened) {
        checkPresence(this.channel).then((isPresent) => {
          if (isPresent) {
            return;
          }
          this._callExodusCB(cb);
        });
      }
    });
  }
};

module.exports = Voyeur;
