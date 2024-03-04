import { SlashCommandBuilder } from "discord.js";
import { JSONFilePreset } from "lowdb/node";

export default {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Check your subscription status."),
  async execute(interaction) {
    const db = await JSONFilePreset(".db.json", { users: [] });
    await db.read();

    const userId = interaction.user.id;

    const index = db.data.users.findIndex((user) => user.id === userId);

    if (index === -1) {
      await interaction.reply({
        content:
          "You are not signed up for the TTS. Please use /signup to sign up!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `Here's your current subscription status!
            id: ${db.data.users[index].id}
            username: ${db.data.users[index].username}`,
        ephemeral: true,
      });
    }
  },
};
