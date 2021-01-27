const fs = require('fs');
const Discord = require('discord.js');

const chronos = require('./lib/chronos');


/**
 * Wrap the logic for reading in the vids file in a function and immediately
 * call it.
 */
const videos = (() => {
  let result = fs.readFileSync('vids.txt').toString().split('\n');
  if (result[result.length -1].length === 0) {
    result = result.slice(0, -1);
  }
  return result;
})();


/* A convenience function for logging messages split into multiple parts. */
const log = (...components) => console.log(components.join(''));


let cooldowns = {
  announcment: new chronos.Cooldown(24*chronos.HOUR),

  logWrongDay: new chronos.Cooldown({
    time: 24*chronos.HOUR,
    callback: () => {
      log('I got a message, but it is *not* Wednesday');
    }
  }),

  logAlreadyAnnounced: new chronos.Cooldown({
    time: 15*chronos.MINUTE,
    callback: () => {
      log('I got a message, *and* it is Wednesday,',
          ' **BUT** I already did the thing.');
    }
  }),

  query: new chronos.Cooldown(chronos.HOUR)
}


const handleAnnouncment = (msg) => {
  if (msg.author.bot) {
    log('I got a message, but I\'m ignoring it because it was from a bot.');
    return false;
  }

  if (chronos.today() !== chronos.WEDNESDAY) {
    cooldowns.logWrongDay.activate();
    return false;
  }

  const activated = cooldowns.announcment.activate(() => {
    let numberOfVideos = videos.length;
    let randomIndex = Math.floor(numberOfVideos*Math.random());
    let videoLink = videos[randomIndex]

    msg.reply(`Also, It's Wednesday my dudes! ${videoLink}`);
    log('I got a message, and It is Wednesday!');
  });

  if (!activated) {
    cooldowns.logAlreadyAnnounced.activate();
  }

  return activated;
};


const handleQuery = (msg) => {
  if (
    msg.mentions.has(client.user) &&
    (/\bwednesday\b/i).test(msg.content)
  ) {
    return cooldowns.query.activate(() => {
      if (chronos.today() === chronos.WEDNESDAY) {
        msg.reply('yeeaaaaAAAaaaAAAHhhhHHHH!!\n\n\n\n...power :frog:');
      } else {
        msg.reply('soon... SOOOOOON!!');
      }
    });
  }

  return false;
};

/* handle a discord message.  Runs on every new message. */
const handleMessage = (msg) => {
  (
    handleAnnouncment(msg)
    || handleQuery(msg)
  );
};

/**
 * main entry point:
 *   - connect to discord
 *   - set up message handler
 *   - disconnect
 *   - repeat
 */
let client;
const connectAndMonitor = async (periodInMilliseconds) => {
  let cooldown = new chronos.Cooldown({
    time: periodInMilliseconds,
    initiallyCold: false
  });

  for (;;) {  /* basically a hipster way of writing while(true) { */
    client = new Discord.Client();
    client.on('ready', () => { log(`Logged in as ${client.user.tag}!`); });
    client.on('message', handleMessage);
    await client.login();

    await cooldown.asPromise();
    log('Reestablishing connection...');
    client.destroy();
  }
};


/* start the whole process: reconnect four times a day */
connectAndMonitor(6*chronos.HOUR).then(()=>{});
