const { Plugin } = require('powercord/entities');

module.exports = class Scream extends Plugin {
  async startPlugin () {
	  powercord.api.commands.registerCommand({
      command: 'scream',
      description: 'Scream your message',
      usage: '{c} <message>',
      executor: (args) => ({send: true, result: encode(args.join(" "))})
    });
	
	powercord.api.commands.registerCommand({
      command: 'descream',
      description: 'Decode a scream',
      usage: '{c} <message>',
      executor: (args) => ({send: true, result: decode(args.join(" "))})
    });
	  
	  powercord.api.commands.registerCommand({
      command: 'silentdescream',
      description: 'Silently decode a scream',
      usage: '{c} <message>',
      executor: (args) => ({send: false, result: decode(args.join(" "))})
    });
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
	return encode1(input).replace(/3/g, "H").replace(/2/g, "h").replace(/1/g, "A").replace(/0/g, "a");
}

function decode(input){
	return decode1(input.trim().replace(/[^aAhH]+/g).replace(/H/g, "3").replace(/h/g, "2").replace(/A/g, "1").replace(/a/g, "0"));
}
