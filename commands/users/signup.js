import { SlashCommandBuilder } from "discord.js";
import { JSONFilePreset } from "lowdb/node";

export default {
  data: new SlashCommandBuilder()
    .setName("signup")
    .setDescription("Sign up for the AI voice training!"),
  async execute(interaction) {
    const db = await JSONFilePreset(".db.json", { users: [] });
    await db.read();

    const userId = interaction.user.id;
    const username = interaction.user.username;

    const index = db.data.users.findIndex((user) => user.id === userId);

    if (index === -1) {
      db.data.users.push({ id: userId, username });
    } else {
      db.data.users[index].username = username;
    }

    await db.write();

    await interaction.reply({
      content: "You have signed up for the AI voice training successfully!",
      ephemeral: true,
    });
  },
};
