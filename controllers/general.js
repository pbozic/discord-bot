const Discord = require("discord.js");
const COMMANDS = require("../commands");
let GLOBAL = {
    generalCommands,
    executeHelp,
    executePurge,
    executePing,
    executeListCommands,
}

function execute(commandObject, message, args) {
    if (typeof  GLOBAL[commandObject.function] === "function") {
        GLOBAL[commandObject.function](commandObject, message, args)
    } 
}
function generalCommands(commandObject, message, args) {
    let text = commandObject.message || "";
    let extra = null;
    
    if (commandObject.files) {
        let files = Array.isArray(commandObject.files) ? commandObject.files : [commandObject.files];
        extra = {
            files
        }
    }

    return message.channel.send(text, extra);
}
async function executePing(commandObject, message, args) {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(message.client.ws.ping)}ms`);
}
async function executePurge(commandObject, message, args) {
 // This command removes all messages from all users in the channel, up to 100.
    if (!message.member.hasPermission("ADMINISTRATOR")) {
        return message.reply("Yeah right.");
    }
    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);
    
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 1 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    
    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.messages.fetch({limit: deleteCount + 1});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
}
async function executeListCommands(commandObject, message, args) {
    let fields = [];
    let commands = [];
    for(let command of Object.keys(COMMANDS.list)) {
        let commandObj = COMMANDS.list[command];
        if (commands.includes(commandObj.command)) {
            continue;
        }
        let usageString = commandObj.usage + " | " + "!help " + command;
        if (commandObj.alias) {
            for (let alias of commandObj.alias) {
                usageString += "\n !" + alias + " | " + "!help " + alias;
            }
        } 
        fields.push({name: commandObj.name, value: usageString});
        commands.push(command);
    }
    const helpEmbed = new Discord.MessageEmbed().setColor('#0099ff').setTitle('Command list').setAuthor('Random Pumper Bot').setDescription("All the commands").addFields(fields);

    message.author.send(helpEmbed)
    return message.delete();
}
function executeHelp(commandObject, message, args) {
    let wantedCommand = COMMANDS.list[args[0]];
    if (!wantedCommand) {
        wantedCommand = commandObject
    }
    const helpEmbed = new Discord.MessageEmbed().setColor('#0099ff').setTitle(wantedCommand.name).setAuthor('Command usage').setDescription(wantedCommand.description || "Very basic command").addField('How to use', wantedCommand.usage);
    if (wantedCommand.alias) {
        helpEmbed.addField('Aliases', wantedCommand.alias.map(a => `!${a} `))
    }
    helpEmbed.setTimestamp().setFooter(
        'API Latency is ' + `${
            Date.now() - message.createdTimestamp
        }` + ' ms'
    );
    return message.reply(helpEmbed)
}
module.exports = {
    execute,
}