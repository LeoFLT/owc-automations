require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const token = process.env.DISCORD_TOKEN;

const clientId = process.env.DISCORD_ID;

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    const verifyUser = new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Verify yourself using your osu! account");
    try {
        console.log(`Started refreshing application (/) commands.`);
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: [verifyUser.toJSON()] },
        );
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();