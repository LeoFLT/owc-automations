require("dotenv").config();
const { Client, ActionRowBuilder, ButtonBuilder,
    ButtonStyle, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("./db");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.login(process.env.DISCORD_TOKEN);
client.once("ready", () => console.log("Ready"));
client.on("messageCreate", async message => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) || message.author.bot)
        return;

    let roles = [];
    if (message.content.startsWith("$verify_role") && message.mentions.roles.size > 0) {
        roles = message.mentions.roles.map(role => [role.id, role.name]);
    } else {
        return;
    }
    if (!roles.length) {
        const embed = new EmbedBuilder()
            .setColor(0xAA0000)
            .setDescription("role(s) not found");
        await message.channel.send({ embeds: [embed] });
        return;
    }
    db.update(
        { guild: message.guild.id },
        { guild: message.guild.id, verifyRoles: roles.map(el => el[0]) },
        { upsert: true },
        (err, number, upsert) => {
            if (err) {
                const embed = new EmbedBuilder()
                    .setColor(0xAA0000)
                    .setDescription(`Error while setting the verified role: ${err.message}`);
                return message.channel.send({ embeds: [embed] });
            }
            else if (upsert || number > 0) {
                const embed = new EmbedBuilder()
                    .setColor(0x00AA00)
                    .setDescription(`Verify role(s) ${(!!upsert) ? "set" : "updated"} to \`${roles.map(el => el[1]).sort().join("`, `")}\``);
                return message.channel.send({ embeds: [embed] });
            }
        }
    );
});

client.on("interactionCreate", async interaction => {
    if (interaction.commandName !== "verify")
        return;
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel("Click to verify")
                .setStyle(ButtonStyle.Link)
                .setURL(`https://osu.ppy.sh/oauth/authorize?client_id=${process.env.OSU_CLIENT_ID}&response_type=code&state=${interaction.id}&redirect_uri=${process.env.CALLBACK_URI}`
                )
        );
    const reply = await interaction.reply({ content: "To start the verification process, please follow the link below:", components: [row], ephemeral: true });
    client.emit("verify", { member: interaction.member.id, interaction: reply.id, guild: interaction.guild.id });
});

module.exports = client;
