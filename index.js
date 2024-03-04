import dotenv from "dotenv";
dotenv.config();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

import { Client, Collection, GatewayIntentBits } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.commands = new Collection();

const commandsDir = path.join(__dirname, "commands");
const commandGroups = fs.readdirSync(commandsDir);

for (const commandGroup of commandGroups) {
  const commandGroupDir = path.join(commandsDir, commandGroup);
  const commandFiles = fs
    .readdirSync(commandGroupDir)
    .filter((file) => file.endsWith(".js"));

  for (const commandFile of commandFiles) {
    const commandFilePath = path.join(commandGroupDir, commandFile);
    const command = (await import(`file://${commandFilePath}`)).default;

    if ("data" in command && "execute" in command) {
      console.log(
        `[COMMAND] ${commandFilePath} registered as "${command.data.name}"`
      );
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${commandFilePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const eventsDir = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsDir)
  .filter((file) => file.endsWith(".js"));

for (const eventFile of eventFiles) {
  const eventFilePath = path.join(eventsDir, eventFile);
  const event = (await import(`file://${eventFilePath}`)).default;

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }

  console.log(`[EVENT] ${eventFilePath} registered as "${event.name}"`);
}

client.login(DISCORD_TOKEN);
