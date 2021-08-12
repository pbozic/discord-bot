"use strict";
let path = require('path');
let fs = require('fs');
let Log = require("unklogger");
const { isArray } = require('util');
let COMMANDS = {
    list: {},
    categories: [],
};
// const WOW_COMMANDS = require("./wow.json");
// const GENERAL_COMMANDS = require("./general.json");
// const ALL_COMMANDS = WOW_COMMANDS.concat(GENERAL_COMMANDS);

let files = getCommandFiles(__dirname,'.json');
for (let file of files) {
    let split = file.split("/");
    let filename = split[split.length - 1];
    let commands_category = filename.split(".")[0];
    COMMANDS[commands_category] = require(`./${filename}`);
    COMMANDS.categories.push(commands_category);
    for(let command of COMMANDS[commands_category]) {
        if (!command.name) {
            command.name = command.command.charAt(0).toUpperCase() + command.command.slice(1);
        }
        if (!command.usage) {
            command.usage = "!" + command.command;
        }
        if (!command.function) {
            command.function = "generalCommands";
        }
       
        command.category = commands_category;
        if (COMMANDS.list[command.command]) {
            Log.error(`1Duplicate commands: [${COMMANDS.list[command.command].category}]${COMMANDS.list[command.command].name} and [${command.category}]${command.name}`);
        }
        COMMANDS.list[command.command] = command;
        if (command.alias) {
            if (!Array.isArray(command.alias)) {
                command.alias = [command.alias];
            }
        }
        if (command.alias) {
            for (let alias of command.alias) {
                if (COMMANDS.list[alias]) {
                    Log.error(`2Duplicate commands: [${COMMANDS.list[alias].category}]${COMMANDS.list[alias].name} and [${command.category}]${command.name}`);
                }
                COMMANDS.list[alias] = command;
            }
           
        } else {
         
        }
      
       
    }
}




module.exports = {
   ...COMMANDS
}



function getCommandFiles(startPath, filter){
    let names = [];

    //console.log('Starting from dir '+startPath+'/')
    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,filter); //recurse
        }
        else if (filename.indexOf(filter)>=0) {
            names.push(filename);
        };
    };
    return names
};

