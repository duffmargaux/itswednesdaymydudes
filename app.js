const fs = require('fs');
const Discord = require('discord.js');

const chronos = require('./lib/chronos');


const DAY_OF_THE_WEEK = (new Date()).getDay();

let announcmentCooldown = new chronos.Cooldown(5000);  /* 5 seconds */


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


let lastResponseTime = 0;


/* A convenience function for logging messages split into multiple parts. */
const log = (...components) => console.log(components.join(''));


/* a function for waiting around for some amount of time */
const sleep = (delayInMilliseconds) => new Promise(
    (res, rej) => setTimeout(res, delayInMilliseconds));


/* handle a discord message.  Runs on every new message. */
const handleMessage = (msg) => {
    if (msg.author.bot) {
        log('I got a message, but I\'m ignoring it because it was from a bot.');
        return;
    }

    let now = new Date();
    let nowTimestamp = now.getTime();
    let today = now.getDay();

    if (today !== DAY_OF_THE_WEEK) {
        log('I got a message, but it is *not* Wednesday');
        return;
    }

    let timeSinceLastResponse = nowTimestamp - lastResponseTime;
    if (timeSinceLastResponse < WEDNESDAY_MESSAGE_COOLDOWN){
        log('I got a message, *and* it is Wednesday,',
            '**BUT** I already did the thing.');
        return;
    }

    let numberOfVideos = videos.length;
    let randomIndex = Math.floor(numberOfVideos*Math.random());
    let videoLink = videos[randomIndex]

    msg.reply(`Also, It's Wednesday my dudes! ${videoLink}`);
    log('I got a message, and It is Wednesday!');
    lastResponseTime = now;
};


/**
 * main entry point:
 *   - connect to discord
 *   - set up message handler
 *   - disconnect
 *   - repeat
 */
const connectAndMonitor = async (periodInMilliseconds) => {
  let cooldown = new chronos.Cooldown(periodInMilliseconds);
  let client;

  for (;;) {  /* basically a hipster way of writing while(true) { */
    client = new Discord.Client();
    client.on('ready', () => { log(`Logged in as ${client.user.tag}!`); });
    client.on('message', handleMessage);
    client.login();

    await cooldown.asPromise();
    log('Reestablishing connection...');

    client.destroy();

    if (Math.random() < 0.25) {
      break;
    }
  }
};


/* start the whole process: reconnect four times a day */
const SIX_HOURS = 21600000;
connectAndMonitor(SIX_HOURS).then(()=>{});
