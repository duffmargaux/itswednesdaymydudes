const fs = require('fs');
const Discord = require('discord.js');


const DAY_OF_THE_WEEK = 3;  /* Wednesday */
const _24_HOURS_IN_MIllISECONDS = 86400000;


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
    if (timeSinceLastResponse < _24_HOURS_IN_MIllISECONDS){
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
    let client = new Discord.Client();
    client.on('ready', () => { log(`Logged in as ${client.user.tag}!`); });
    client.on('message', handleMessage);
    client.login();

    await sleep(periodInMilliseconds);

    log('Reestablishing connection...');

    client.destroy();
    client = null;

    return await connectAndMonitor(periodInMilliseconds);
};


/* start the whole process: reconnect four times a day */
connectAndMonitor(_24_HOURS_IN_MIllISECONDS/4).then(()=>{});
