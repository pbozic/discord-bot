const Discord = require("discord.js");
const Log = require("unklogger");
const axios = require("axios");
const blizzard = require('blizzard.js');
const NotesHelper = require("../helpers/notes");

console.log(process.env.BLIZZARD_CLIENT_ID);
let blizzardClient = blizzard.initialize({
    key: process.env.BLIZZARD_CLIENT_ID, 
    secret: process.env.BLIZZARD_CLIENT_SECRET, 
    origin: 'us', // optional
    locale: 'en_US' // optional
});
let BLIZZ_AUTH_TOKEN;

let GLOBAL = {
    getEntityInfo,
    latestPatchNotes,
}
let DISCORD_CLIENT = null;

async function latestPatchNotes(commandObj, message, args) {
    let note = await NotesHelper.getLatestNote();
    NotesHelper.sendPatchNote(message, note);
}

function setClient(client) {
    Log.info("client set");
    DISCORD_CLIENT = client;
   NotesHelper.scrapeNotes(DISCORD_CLIENT);
}
function getBlizzAccess() { // TODO: Throtle requests for new acces token
    return new Promise(async (resolve, reject) => {
        try {
            let response = await blizzardClient.getApplicationToken();
            BLIZZ_AUTH_TOKEN = response.data.access_token;
            console.log("Blizz auth token ", BLIZZ_AUTH_TOKEN);
            resolve();
        } catch (error) {
            reject(error);
        }

    })
}

async function getEntityInfo(commandObj, message, args) {
    let entityName = args.join(" ");
    let entityType = commandObj.command;
    try {
        let response1 = await axios.get(`https://us.api.blizzard.com/data/wow/search/${entityType}?namespace=static-us&locale=en_US&name.en_US=${entityName}&orderby=id&_page=1&access_token=${BLIZZ_AUTH_TOKEN}`);

        let entityId = null;
        for (let entity of response1.data.results) {
            console.log(entity.data.name);
            if (entity.data.name.en_US.toLowerCase() === entityName.toLowerCase()) {
                entityId = entity.data.id;
                break;
            }
        }
        if (!entityId) {
            return message.reply(`No ${entityType} with that name!`);
        }
        let response2 = await axios.get(`https://us.api.blizzard.com/data/wow/${entityType}/${entityId}?namespace=static-us&locale=en_US&access_token=${BLIZZ_AUTH_TOKEN}`);
        let response3 = await axios.get(`https://us.api.blizzard.com/data/wow/media/${entityType}/${entityId}?namespace=static-us&locale=en_US&access_token=${BLIZZ_AUTH_TOKEN}`)
        let info = {
            id: entityId,
            name: response2.data.name,
            image: response3.data.assets[0].value
        }
        if (entityType == "item") {
            info.description= `${
                response2.data.quality.name
            } ${
                response2.data.inventory_type.name
            }`;
        } else if (entityType = "spell") {
            info.description = response2.data.description
        }

        const helpEmbed = new Discord.MessageEmbed().setColor('#0099ff').setTitle(info.name).setAuthor('DrDrvo the wise').setURL(`https://www.wowhead.com/${entityType}=${info.id}`).setDescription(info.description).setThumbnail(info.image).setTimestamp().setFooter(
            'API Latency is ' + `${
                Date.now() - message.createdTimestamp
            }` + ' ms'
        );
    
        return message.channel.send(helpEmbed);
       
    } catch (error) {
        console.log(error.message);
    }
}
async function execute(commandObject, message, args) {
    let command = commandObject.command;
    await getBlizzAccess();
    
    if (typeof GLOBAL[commandObject.function] === "function") {
        GLOBAL[commandObject.function](commandObject, message, args);
    } else {
        //TODO: handle general functions
    }
}

module.exports = {
    execute,
    client: blizzardClient,
    getBlizzAccess,
    setClient
}
