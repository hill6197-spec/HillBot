require("dotenv").config();

const tmi = require("tmi.js");
const axios = require("axios");
const fs = require("fs");

const client = new tmi.Client({
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH
  },
  channels: [process.env.TWITCH_CHANNEL]
});

client.connect();

let maps = [];

if (fs.existsSync("maps.json")) {
  maps = JSON.parse(fs.readFileSync("maps.json"));
}
client.on("message", async (channel, tags, message, self) => {

  if (self) return;

  if (!message.toLowerCase().startsWith("!map ")) return;

  const args = message.split(" ");

  if (args.length < 2) {
    client.say(channel, @${tags.username} Please enter a map code.);
    return;
  }

  const code = args[1];

  const mapName =
    args.length > 2
      ? args.slice(2).join(" ")
      : "No name provided";
const codeRegex = /^\d{4}-\d{4}-\d{4}$/;

  if (!codeRegex.test(code)) {
    client.say(
      channel,
      @${tags.username} That doesn't look like a valid Fall Guys map code. Please use the format 1234-5678-9012
    );
    return;
  }

  const submission = {
    user: tags.username,
    code: code,
    name: mapName,
    submitted: new Date().toISOString()
  };

  maps.push(submission);

  fs.writeFileSync("maps.json", JSON.stringify(maps, null, 2));
  try {
    await axios.post(process.env.DISCORD_WEBHOOK, {
      content:
`🎮 *New Fall Guys Map Submitted*

👤 *Submitted by:* ${tags.username}

🗺️ *Map Name:* ${mapName}

🔢 *Map Code:* \`${code}\``
    });

    client.say(
      channel,
      @${tags.username} ✅ Thanks! Your map "${mapName}" (${code}) has been submitted to Discord!
    );

  } catch (err) {

    console.error(err);

    client.say(
      channel,
      @${tags.username} Sorry, something went wrong while submitting your map.
    );
  }

});
