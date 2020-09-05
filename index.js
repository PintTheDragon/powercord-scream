const { Plugin } = require('powercord/entities');
const { getModule } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { messages } = require('powercord/webpack');
const { receiveMessage } = messages;
const dispatcher = getModule(["dirtyDispatch"], false);

module.exports = class Scream extends Plugin {
    async startPlugin () {
        const { createBotMessage } = await getModule(['createBotMessage']);

        powercord.api.commands.registerCommand({
            command: 'scream',
            description: 'Scream your message',
            usage: '{c} <message>',
            executor: (args) => ({send: true, result: encode(args.join(" "))})
        });

        powercord.api.commands.registerCommand({
            command: 'descream',
            description: 'Decode a scream and send it',
            usage: '{c} <message>',
            executor: (args) => ({send: true, result: decode(args.join(" "))})
        });

        powercord.api.commands.registerCommand({
            command: 'silentdescream',
            description: 'Decode a scream without sending it',
            usage: '{c} <message>',
            executor: (args) => ({send: false, result: decode(args.join(" "))})
        });

        let msgs = [];

        inject("scream-decode", dispatcher, "dispatch", (args) => {
            if(args[0].type === "MESSAGE_CREATE" && !args[0].optimistic){
                if(!msgs.includes(args[0].message.id)){
                    msgs.push(args[0].message.id);
                    setTimeout(() => {
                        const index = msgs.indexOf(args[0].message.id);
                        if (index > -1) {
                            msgs.splice(index, 1);
                        }
                    }, 3000);
                    let msg = args[0].message.content;
                    if(decrypt(msg, msg.length).startsWith("hhAH")){
                        msg = decode(msg);
                        const receivedMessage = createBotMessage(args[0].message.channel_id, {});
                        receivedMessage.content = msg;
                        receiveMessage(receivedMessage.channel_id, receivedMessage);
                    }
                }
            }
            return args;
        });
    }

    pluginWillUnload () {
        uninject("scream-decode");
    }
}

function encode1(input) {
    let out = "";

    [...input].forEach((item) => {
        out+=item.charCodeAt(0).toString(4).padStart(4, "0");
    });

    return out;
}

function decode1(input){
    let split = ((a,b)=>Array.from({length:Math.ceil(a.length/b)},(e,r)=>a.slice(r*b,r*b+b)))(input, 4);
    let out = "";

    split.forEach((item) => {
        out+=String.fromCharCode(parseInt(item, 4));
    });

    return out;
}

function encode(input){
    let res1 = encode1("§"+input).replace(/3/g, "H").replace(/2/g, "h").replace(/1/g, "A").replace(/0/g, "a");
    return encrypt(res1, res1.length);
}

function decode(input){
    let fixed = input.trim().replace(/[^aAhH]+/g);
    fixed = decrypt(fixed, fixed.length);
    return decode1(fixed.replace(/H/g, "3").replace(/h/g, "2").replace(/A/g, "1").replace(/a/g, "0")).substr(1);
}

function encrypt(input, key){
    let key1 = key % 2147483647;
    let arr = input.split("");

    for (let i = 0; i < 100; i++) {
        key1 = (key1 * 16807) % 2147483647;
        let tmpKey = key1;
        key1 = (key1 * 16807) % 2147483647;

        let tmp1 = arr[tmpKey % arr.length];

        arr[tmpKey % arr.length] = arr[key1 % arr.length];
        arr[key1 % arr.length] = tmp1;
    }
        key1++;
    return arr.join("");
}

function decrypt(input, key){
    let key1 = key % 2147483647;
    let keys = [];
    let arr = input.split("");

    for(let i = 0; i < 100; i++){
        let tmpArr = [];

        key1 = (key1 * 16807) % 2147483647;
        tmpArr.push(key1 % arr.length);

        key1 = (key1 * 16807) % 2147483647;
        tmpArr.push(key1 % arr.length);

        keys.push(tmpArr);
    }

    keys = keys.reverse();

    keys.forEach((keyArr) => {
        let tmp1 = arr[keyArr[0]];

        arr[keyArr[0]] = arr[keyArr[1]];
        arr[keyArr[1]] = tmp1;
    });

    return arr.join("");
}