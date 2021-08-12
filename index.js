// Load up the discord.js library
"use strict";
require('dotenv').config();


const Discord = require("discord.js");
const fs = require("fs");

const axios = require("axios");
const config = require("./config.json");


const COMMANDS = require("./commands");
const GeneralController = require("./controllers/general");
const WowController = require("./controllers/wow");
const UserController = require("./controllers/user");
const AudioController = require("./controllers/audio");

const Log = require("unklogger");

const intents = new Discord.Intents([
    Discord.Intents.NON_PRIVILEGED,
    "GUILD_MEMBERS",
]);
const client = new Discord.Client({
    ws: intents,
    partials: ['USER', 'GUILD_MEMBER'],
});


client.on("ready", async () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  try {
    WowController.setClient(client);
    await WowController.getBlizzAccess();
  } catch {
    console.log("Blizzard API error!");
  }


  UserController.getUsers(client);
  client.user.setActivity("The world burn.", { type: "WATCHING"})
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity("The world burn.", { type: "WATCHING"})
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});

client.on("guildMemberUpdate", async (oldUser, newUser) => {
   UserController.guildMemberUpdate(oldUser, newUser);
});

client.on("message", async message => {
    console.log("New msg", message.content);
   
  if(message.content.toLowerCase().trim() == "yep") {
      message.reply("COCK");
  }
  if(message.content.toLowerCase().trim() == "nope") {
    message.reply("You're bald.");
}
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;

  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  if (Object.keys(COMMANDS.list).includes(command) == false) {
    return message.reply("No such command. Type !commands for list of commands");
  }

  let category = COMMANDS.list[command].category;
  
  if (!category) {
    return Log.error("No categroy");
  }

  let commandObject = COMMANDS.list[command];

  switch (category) {
    case "general":
      GeneralController.execute(commandObject, message, args)
      break;
    case "wow":
      WowController.execute(commandObject, message, args)
      break;
    case "users":
      UserController.execute(commandObject, message, args)
      break;
    case "audio":
      AudioController.execute(commandObject, message, args)
      break;
    default:
      break;
  }
});

client.login(config.token);