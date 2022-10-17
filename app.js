const db = require("./db");
const server = require("./server");
const discordClient = require("./discordApp");

discordClient.on("verify", verifyObj => {
    db.insert(verifyObj);
});

server.on("user_verified", async result => {
    try {
        const guild = await discordClient.guilds.fetch(result.guild);
        const member = await guild.members.fetch(result.member);
        member.setNickname(result.usernameAPI);

        const rolesToAdd = [];
        for (const role of result.role) {
            const findRole = guild.roles.cache.find(el => el?.name?.toLowerCase() === role?.toLowerCase());
            if (findRole)
                rolesToAdd.push(findRole.id);
        }
        db.findOne(
            {
                guild: guild.id,
                verifyRoles: { $exists: true }
            },
            async (err, doc) => {
                if (err)
                    return;
                if (doc) {
                    if (doc.hasOwnProperty("verifyRoles")) {
                        rolesToAdd.push(...doc.verifyRoles);
                    }
                }
                member.roles.add(rolesToAdd);
            }
        );
    } catch (e) {
        console.log({ e });
    }
});
