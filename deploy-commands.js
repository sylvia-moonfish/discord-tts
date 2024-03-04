import dotenv from "dotenv";
dotenv.config();
const CLIENT_ID = process.env.CLIENT_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

import { REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];

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
      console.log(`${commandFilePath} registered as "${command.data.name}"`);
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: [],
    });

    const data = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      {
        body: commands,
      }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (err) {
    console.error(err);
  }
})();
