const Discord = require("discord.js");
const fs = require('fs');
const client = new Discord.Client();
const DAY_OF_THE_WEEK = 0;  /*Wednesday*/

let last_response_time = 0;

const _24_HOURS_IN_MIllISECONDS = 10000;
//const _24_HOURS_IN_MIllISECONDS = 86400000;

let vids = fs.readFileSync('vids.txt').toString().split('\n');
  
if (vids[vids.length -1].length === 0) {
    vids = vids.slice(0, -1);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.author.bot) {return;}

    if ((new Date()).getDay() !== DAY_OF_THE_WEEK){
        console.log('I got a message, but it is *not* Wednesday');
        return;
    }

    let now = Date.now();

    if (now - last_response_time < _24_HOURS_IN_MIllISECONDS){
        console.log('I got a message, *and* it is Wednesday, **BUT** I already did the thing.');
        return;
    }
    let numberOfVideos = vids.length;
    let randomIndex = Math.floor(numberOfVideos*Math.random());
    let videoLink = vids[randomIndex]
    msg.reply(`Also, It's Wednesday my dudes! ${videoLink}`);
    console.log("I got a message, and It is Wednesday!");
    last_response_time = now;    
});

client.login();

