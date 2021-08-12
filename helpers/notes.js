
let fs = require("fs");
let Discord = require("discord.js");
let cheerio = require("cheerio");
let axios = require("axios");
let link = "https://worldofwarcraft.com/en-gb/content-update-notes";

let articleClass = ".NewsBlog";
const notesChannel = "patchwerk-notes";
let PatchNote = require("../models/PatchNote");

async function getLatestNote() {
    try {
        let note = (await PatchNote.orderBy('id', 'DESC').first()).toJSON();
        return note;
    } catch (error) {
        console.log(error)
    }
}
async function getNotes() {
    let {data} = await axios.get(link);
    let $ = await  cheerio.load(data);
    let notes = [];
    $(".NewsBlog").each(function(i, article) {
        let aEl = $(article).find("a");
        let datetime = $(article).find(".LocalizedDateMount").data("props").iso8601;
        let artLink = "https://worldofwarcraft.com" + $(aEl).attr("href");
        let title = $(article).find(".NewsBlog-title").text();
        let description = $(article).find(".NewsBlog-desc").text();

        notes.push({
            article_date: datetime,
            title,
            description,
            link: artLink,
        }) 
    })
   
    return notes;
}
async function scrapeNotes(discord_client) {
    
    let notes = await getNotes();
    console.log("NEWS", notes);
    for(let note of notes.reverse()) {
        let noteObj = new PatchNote(note);
        try {
            await noteObj.save();
            await sendPatchNoteToPatchChannel(discord_client, note);
        } catch (error) {
            if (error.code === "SQLITE_CONSTRAINT") {
                console.log(error);
            } else {
                console.log(error);
            }
           
        }
       
    }
}
async function sendPatchNote(message, note) {
    const helpEmbed = new Discord.MessageEmbed().setColor('#0099ff').setTitle(note.title).setAuthor('DrDrvo the wise').setURL(note.link).setThumbnail("https://assets.worldofwarcraft.com/static/components/Logo/Logo-wowIcon.01e2c443798558c38d8e3b143a6f0d03.png").setDescription(note.description).setTimestamp().setFooter(
        'API Latency is ' + `${
            Date.now() - message.createdTimestamp
        }` + ' ms'
    );
    message.author.send(helpEmbed);
    return message.delete();
}
async function sendPatchNoteToPatchChannel(client, note) {
    console.log(note);
    const channel = client.guilds.cache.find(g => g.name === "Pumper Gang").channels.cache.find(ch => ch.name === notesChannel);
    const helpEmbed = new Discord.MessageEmbed().setColor('#0099ff').setTitle(note.title).setAuthor('DrDrvo the wise').setURL(note.link).setThumbnail("https://assets.worldofwarcraft.com/static/components/Logo/Logo-wowIcon.01e2c443798558c38d8e3b143a6f0d03.png").setDescription(note.description).setTimestamp();
    return channel.send(helpEmbed);
}
module.exports = {
    getLatestNote,
    scrapeNotes,
    sendPatchNote,
}