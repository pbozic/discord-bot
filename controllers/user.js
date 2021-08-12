let Log = require("unklogger");
let userIds = {};

let GLOBAL = {
    executeTerra,
    executeRaysio
};
let TERRA_BEING_A_BITCH;
let RAYSIO_BEING_A_BITCH;
async function execute(commandObject, message, args) {
    let command = commandObject.command;
    if (typeof GLOBAL[commandObject.function] === "function") {
        GLOBAL[commandObject.function](commandObject, message, args);
    } else {
        //TODO: handle general functions
    }
}

function guildMemberUpdate(oldUser, newUser) {
    if (newUser.user.username === "Jitko") {
        newUser.setNickname("StRoyanOFF")
    }
    if (RAYSIO_BEING_A_BITCH) {
        if (newUser.user.username === "Raysio") {
            newUser.setNickname("Nothreatsio")
        }
    }
    if (TERRA_BEING_A_BITCH) {
      if (newUser.user.username === "Terra03") {
          newUser.setNickname("basquetard")
      }
  }
}
async function getUsers(client) {
    Log.info("Getting users");
    return await new Promise(async (resolve, reject) => {
        let guilds = client.guilds.cache.array();
  
        for (let i = 0; i < guilds.length; i++) {
            let guild = await client.guilds.fetch(guilds[i].id);
            try {
                let members = await guild.members.fetch({force: true});

                for(let member of members) {
                //console.log(member[1].user.username);
                if (userIds[guilds[i].id] == null) {
                    userIds[guilds[i].id] = {}
                }
                    userIds[guilds[i].id][member[1].user.username] = member[1];
                    if (member[1].user.username === "Jitko") {
                        member[1].setNickname("StRoyanOFF")
                    }
                    // if (member[1].user.username === "Raysio") { 
                    //     console.log(member[1].user);
                    // }
                    if (RAYSIO_BEING_A_BITCH) {
                        if (member[1].user.username === "Raysio") { 
                            console.log(member[1].user);
                            member[1].setNickname("Nothreatsio")
                        }
                    }
                    if (TERRA_BEING_A_BITCH) {
                    if (member[1].user.username === "Terra03") { 
                        member[1].setNickname("basquetard")
                    }
                }
                    
                }
                resolve();
            } catch (error) {
                console.log(error);
                reject(error);
            }
        }
    });
}
function getUserByName() {

}
function getUserById(guildId, userId) {

}
function executeTerra(commandObject, message, args) {
    Log.info("Terra executing");
    let allowed = ["pbozic", "Psajo"];
    if (!allowed.includes(message.author.username)) {
      return message.reply("And who are you?");
    }
    let isBitch = TERRA_BEING_A_BITCH;
    if (args[0] == "yes") {
      isBitch = true;
    }
    if (args[0] == "no") {
      isBitch = false;
    }
    if (args[0] == "status") {
        let yes = "Terra is being a bitch.";
        let no = "Terra is a good boy today.";
        return message.reply(isBitch ? yes : no);
    }
    TERRA_BEING_A_BITCH = isBitch;
    console.log("isBitch", TERRA_BEING_A_BITCH);
    if (TERRA_BEING_A_BITCH) {
      userIds[message.guild.id]["Terra03"].setNickname("basquetard");
    } else {
      userIds[message.guild.id]["Terra03"].setNickname("Terra");
    }
    return message.reply("I took care of that.");
}
function executeRaysio(commandObject, message, args) {
    let allowed = ["pbozic", "Psajo"];
    if (!allowed.includes(message.author.username)) {
      return message.reply("And who are you?");
    }
    let isBitch = RAYSIO_BEING_A_BITCH;
    if (args[0] == "yes") {
      isBitch = true;
    }
    if (args[0] == "no") {
      isBitch = false;
    }
    if (args[0] == "status") {
        let yes = "Raysio is being a bad tribal shaman.";
        let no = "Raysio is a good tribal shaman.";
        return message.reply(isBitch ? yes : no);
    }
    RAYSIO_BEING_A_BITCH = isBitch;
    if (RAYSIO_BEING_A_BITCH) {
      userIds[message.guild.id]["Raysio"].setNickname("Nothreatsio");
    } else {
      userIds[message.guild.id]["Raysio"].setNickname("Raysio");
    }
    return message.reply("I took care of that.");
}
module.exports = {
    execute,
    guildMemberUpdate,
    getUsers,
    executeTerra
}