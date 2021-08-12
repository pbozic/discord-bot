const Discord = require("discord.js");
const queue = new Map();
let REPEAT = false;
const ytdl = require('ytdl-core');

var YouTube = require('youtube-node');
var youTube = new YouTube();
youTube.setKey(process.env.YOUTUBE_KEY);
let dispatchers = {};



function execute(commandObj, message, args) {
    const serverQueue = queue.get(message.guild.id);
    let command = commandObj.command;
    if(message.channel.name == "groovybot" || message.channel.name == "development") {
        if (command === "play" || command === "p") {
            executeSong(message, serverQueue);
            return;
        } else if (command === "skip") {
            skip(message, serverQueue);
            return;
        } else if (command === "stop") {
            stop(message, serverQueue);
            return;
        } else if (command === "clear") {
            stop(message, serverQueue);
            return;
        } else if (command === "repeat") {
        REPEAT = !REPEAT;
        if (REPEAT) {
            message.reply("Started repeating the song.");
        } else {
            message.reply("Stopped repeating the song.");
        }
        return;
        } else if (command === "volume") {
          const volume = parseInt(args[0], 10);
          if(!volume || volume < 1 || volume > 10)
              return message.reply("Please provide a number between 2 and 100 for the volume");
            
          }
          dispatchers[message.guild.id].setVolumeLogarithmic(volume / 80)
    }
}

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }
async function searchYoutube(string) {
  return new Promise((resolve, reject) => {
    youTube.search(string, 2, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
     
    });
  })
}
async function executeSong(message, serverQueue, silent = false) {
  const args = message.content.split(" ");
  const command = args.shift();
  let url = args[0];
  console.log("URL: ", url);
  if (validURL(url) == false) {
    try {
      let result = await searchYoutube(args.join(" "));
      console.log("found", result.items[0].id);
      url = "https://www.youtube.com/watch?v=" + result.items[0].id.videoId
    } catch (error) {
      console.log(error)
    }
  }
  

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }
  const songInfo = await ytdl.getInfo(url);
  console.log(songInfo);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url
  };
  console.log(song);
  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 1.1,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0], skip);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    if (silent) {
        return;
    }
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song, silent = false, repeat = false) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  dispatchers[guild.id] = serverQueue.connection
    .play(ytdl(song.url, {quality: 'highestaudio', highWaterMark: 1 << 25 }))
    .on("finish", () => {
      if (!REPEAT) {
        serverQueue.songs.shift();
      }
     
      play(guild, serverQueue.songs[0], REPEAT);
    })
    .on("error", error => console.error(error));

    dispatchers[guild.id].setVolumeLogarithmic(serverQueue.volume / 10);
    if (!silent) {
        serverQueue.textChannel.send(`${repeat ? "Repeat" : "Start"} playing: **${song.title}**`);
    }
 
}
module.exports = {
    execute
}