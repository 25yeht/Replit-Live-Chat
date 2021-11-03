const titleCase = str => {
   var splitStr = str.toLowerCase().split(" ");
   for (var i = 0; i < splitStr.length; i++) {
       // You do not need to check if i is larger than splitStr length, as your for does that for you
       // Assign it back to the array
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
   }
   // Directly return the joined string
   return splitStr.join(" "); 
}, { uniqueNamesGenerator, adjectives, colors, animals } = require("unique-names-generator"), socketIO = require("socket.io"), respondWithFile = (path, type, res) => {
	res.writeHead(200, {
		"Content-Type": type
	});
	const readStream = fs.createReadStream(path);
	readStream.pipe(res);
} ,path = require("path"), paths = {
	"/": (req, res) => {
		respondWithFile("index.html", "text/html", res);
	},
	"/beta": (req, res) => {
		respondWithFile("beta.html", "text/html", res);
	},
	"/favicon.png": (req, res) => {
		respondWithFile("cdn/favicon.png", "image/png", res);
	},
	"/keep-alive": (req, res) => {
		res.writeHead(200, {"Content-Type": "text/plain"}).end("Hi :)");
	},
	"/cdn/lib/socket.io.js": (req, res) => {
		respondWithFile("cdn/lib/socket.io.js", "text/javascript", res);
	},
	"/cdn/audio/pop.mp3": (req, res) => {
		respondWithFile("cdn/audio/pop.mp3", "audio/mp3", res);
	},
	"/cdn/audio/join.mp3": (req, res) => {
		respondWithFile("cdn/audio/join.mp3", "audio/mp3", res);
	},
	"/cdn/audio/fbi-open-up.mp3": (req, res) => {
		respondWithFile("cdn/audio/fbi-open-up.mp3", "audio/mp3", res);
	}
} , url = require("url"), fs = require("fs"), server = require("http").createServer((req, res) => {
	var hasCanada = false;
	for(var i = 0; i < Object.keys(paths).length; i++) {
		if(req.url.replace(/\?.*/, "") == Object.keys(paths)[i]) {
			try {
				paths[Object.keys(paths)[i]](req, res);
			} catch(e) {
				console.error(e)
				res.writeHead(500, {
					"Content-Type": "text/plain"
				}).end("500 internal server error");
			}
			hasCanada = true;
		} else if(req.url.toLowerCase().replace(/\?.*/, "") == Object.keys(paths)[i]) {
			res.writeHead(302, {
				"Location": req.url.toLowerCase()
			});
			res.end();
			hasCanada = true;
		} else if(req.url.toLowerCase().replace(/\?.*/, "").replace(/\/$/, "") == Object.keys(paths)[i]) {
			res.writeHead(302, {
				"Location": req.url.toLowerCase().replace(/\/(\?.*)?$/, "") + (url.parse(req.url, true).search ? url.parse(req.url, true).search : "")
			});
			res.end();
			hasCanada = true;
		}
	}
	if(!hasCanada) res.writeHead(404, {"Content-Type": "text/plain"}).end("404 not found");
});
server.listen(err => {
	if(err) throw err;
	console.log("Server is up and running.");
}), io = socketIO(server);

function cap(string) {
	return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

var messages = [];
var clients = [];
var clientNames = [];

const pedoPhrases = [
	/Ge*t*\w*Na*k*[a|e|i|o|u]*d*\w*On*Ca*m*e*r*a*/gi
];
function pedoTest(str) {
	var isPedo = false;
	for(var i = 0; i < pedoPhrases.length; i++) {
		if(pedoPhrases[i].test(str)) isPedo = true;
	}
	return isPedo;
}

require("readline").createInterface({
	input: process.stdin,
	output: process.stdout
}).question("\x1b[2mFocus the console and press enter to shutdown the server and alert the clients :)\x1b[0m\n", _ => {
	io.sockets.emit("serverRestart");
	process.exit(1);
});

io.on("connection", socket => {
	if(clients.length < 20) {
		clients.push(socket.id);
		const name = titleCase(uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] }).replace(/_/g, " "));
		clientNames.push(name);
		socket.emit("yourNameIs", name);
		//Main
		console.log(`\x1b[32m${name} connected!\x1b[0m`);
		var clientMessages = [];
		var canMessage = true;
		const noSpammingUpdateInterval = setInterval(_ => {
			clientMessages = [];
		}, 5000);
		var noSpamMs = 25000;
		var userIsPedo = false;
		const noSpammingInterval = setInterval(_ => {
			if(clientMessages.length > 10) {
				canMessage = false;
				clientMessages = [];
				var canMessageAfterTimeout = setTimeout(_ => {
					noSpamMs *= 2;
					canMessage = true;
				}, noSpamMs);
				socket.emit("systemMessageBad", "Please don't spam. You will not be able to send messages for the next " + noSpamMs/1000 + " seconds.");
				socket.broadcast.emit("plainMessage", name + " cannot spam anymore.");
			}
		}, 100);
		socket.broadcast.emit("userJoin", name);
		socket.on("message", msg => {
			if(!pedoTest(msg) && typeof msg == "string") {
				if(msg && typeof msg == "string" && clients.length <= 20 && msg.replace(/[\s|‎]/g, "") != "" && canMessage && !pedoTest(msg) && !pedoTest(msg)) {
					if(msg.toLowerCase() != "$fbiprank") {
						const filteredMsg = msg.slice(0, 50)
						//Fuck
						.replace(/f+[a|e|i|o|u|\d]+[k|c]+/gi, "!#&@")
						//Bitch
						.replace(/b+.+t*c+h+/gi, "&#!&@!")
						//Fucking
						.replace(/\[Swear word\]ing/gi, "*@&#_!@")
						//Pussy
						.replace(/p[a|e|i|o|u]+s+y+/gi, "*#*@&")
						//Dick
						.replace(/d+[^u]+[c|k]+/gi, "*&@#")
						//P*nis
						.replace(/p+[a|e|i|o|u|\d]+n[a|e|i|o|u|\d]+s+/gi, "<@?*@")
						//$zhanghua#
						.replace(/\$zhanghua#/gi, "*~4/?<^>#$")
						//$aswearword#
						.replace(/\$aswearword#/gi, "*>!&@#!*~.%\\")
						//Age/Sex/Location
						.replace(/ag*e*(\/?\w?)+se*x*(\/?\w?)lo*c*a*t*i*o*n*\?*/gi, "*@#");

						console.log(`\x1b[30m\x1b[47mChat message from ${name}:\x1b[0m \x1b[4m${filteredMsg}\x1b[0m`);
						clientMessages.push(msg);
						messages.push(filteredMsg);
						io.sockets.emit("message", {
							author: name,
							content: filteredMsg
						});
					} else if(msg.toLowerCase() == "$fbiprank") {
						io.sockets.emit("fbiPrank");
						socket.emit("kickOut", "You've been kicked out because you pranked everyone.");
						socket.disconnect();
						io.sockets.emit("plainMessage", `You've been pranked by ${name}!`);
						
					}
				} else if(msg && typeof msg == "string" && msg.replace(/[\s|‎]/g, "") == "" && canMessage && !pedoTest(msg)) {
					socket.emit("systemMessageBad", "You can't send an empty message!");
				} else if(msg && typeof msg == "string" && msg.replace(/[\s|‎]/g, "" != "") && clients.length <= 20 && canMessage && !pedoTest(msg)) {
					socket.emit("systemMessageBad", "Whoops! The are more than 20 people in the chat room! Timestamp: " + new Date());
				}
			} else if(!pedoTest(msg)) {
				userIsPedo = true;
				socket.emit("kickOut", "Please don't be a pedophile. You have been kicked out of the chat.");
				socket.disconnect();
				socket.broadcast.emit("plainMessage", name + " has been kicked out because " + name + " is a potential internet predator.");
			}
		});
		socket.on("__BETA_message", msg => {
			if(!pedoTest(msg) && typeof msg == "string") {
				if(msg && typeof msg == "string" && clients.length <= 20 && msg.replace(/[\s|‎]/g, "") != "" && canMessage && !pedoTest(msg)) {
					const filteredMsg = msg.slice(0, 50)
					//Fuck
					.replace(/f+[a|e|i|o|u|\d]+[k|c]+/gi, "!#&@")
					//Bitch
					.replace(/b+.+t*c+h+/gi, "&#!&@!")
					//Fucking
					.replace(/\[Swear word\]ing/gi, "*@&#_!@")
					//Pussy
					.replace(/p[a|e|i|o|u]+s+y+/gi, "*#*@&")
					//Dick
					.replace(/d+[^u]+[c|k]+/gi, "*&@#")
					//P*nis
					.replace(/p+[a|e|i|o|u|\d]+n[a|e|i|o|u|\d]+s+/gi, "<@?*@")
					//$zhanghua#
					.replace(/\$zhanghua#/gi, "*~4/?<^>#$")
					//$aswearword#
					.replace(/\$aswearword#/gi, "*>!&@#!*~.%\\")
					//Age/Sex/Location
					.replace(/ag*e*(\/?\w?)+se*x*(\/?\w?)lo*c*a*t*i*o*n*\?*/gi, "*@#");

					console.log(`\x1b[30m\x1b[47mChat message from ${name}:\x1b[0m \x1b[4m${filteredMsg}\x1b[0m (Beta)`);
					clientMessages.push(msg);
					messages.push(filteredMsg);
					io.sockets.emit("__BETA_message", {
						author: name,
						content: filteredMsg
					});
				} else if(msg && typeof msg == "string" && msg.replace(/[\s|‎]/g, "") == "" && canMessage && !pedoTest(msg)) {
					socket.emit("systemMessageBad", "You can't send an empty message!");
				} else if(msg && typeof msg == "string" && msg.replace(/[\s|‎]/g, "" != "" && !pedoTest(msg)) && clients.length <= 20 && canMessage) {
					socket.emit("systemMessageBad", "Whoops! The are more than 20 people in the chat room! Timestamp: " + new Date());
				}
			} else if(!pedoTest(msg)) {
				userIsPedo = true;
				socket.emit("kickOut", "Please don't be a pedophile. You have been kicked out of the chat.");
				socket.disconnect();
				socket.broadcast.emit("plainMessage", name + " has been kicked out because " + name + " is a potential internet predator.");
			}
		});
		socket.on("disconnect", _ => {
			clients.splice(clients.indexOf(socket.id), 1);
			clientNames.splice(clients.indexOf(socket.id), 1);
			console.log(`\x1b[31m${name} disconnected!\x1b[0m`);
			socket.broadcast.emit("userLeave", {
				user: name,
				isPedo: userIsPedo
			});
		});
	} else {
		socket.emit("kickOut", "You have been kicked out of the chat because the are too many people in the chat. Please check back later.");
	}
});