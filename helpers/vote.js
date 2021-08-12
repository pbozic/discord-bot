"use strict";
const fs = require("fs");

  class Vote {
    constructor(question, options, owner, server) {
        this.question = question;
        this.options = options;
        this.owner = owner;
        this.server = server;
        this.answers = {}
        for(let option of this.options) {
            this.answers[option] = {
                count: 0,
                votes: [],
            }
        }
    }
    // get() {
    //     return {
    //         question: this.question,
    //         options: this.options,
    //         owner: this.owner,
    //         server: this.server,
    //         answers: this.answer,
    //     }
    // }

};
exports = Vote