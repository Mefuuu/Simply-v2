const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const guildcfgs = require('../../schemas/guildcfg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perms')
        .setDescription('Used to edit the permission power.')
        .setDescriptionLocalizations({
            pl: 'Służy do edycji mocy permisji.',
        })
        .addSubcommand(subcommand => subcommand
            .setName('commands')
            .setDescription('Edit permission power for commands.')
            .setDescriptionLocalizations({
                pl: 'Edytuj moc permisji dla komend.',
            })
            .addStringOption(option => option
                .setName('command')
                .setDescription('Enter a command name you want to change permission power.')
                .setDescriptionLocalizations({
                    pl: 'Wpisz nazwę komendy, której chcesz zmienić moc permisji.',
                })
                .setRequired(true))
            .addIntegerOption(option => option
                .setName('value')
                .setDescription('Enter permission power value you want to set')
                .setDescriptionLocalizations({
                    pl: 'Wpisz wartość mocy permiji, którą chcesz ustawić.',
                })
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('roles')
            .setDescription('Edit permission power for roles.')
            .setDescriptionLocalizations({
                pl: 'Edytuj moc permisji dla ról.',
            })
            .addRoleOption(option => option
                .setName('role')
                .setDescription('Choose role you want to change permission power.')
                .setDescriptionLocalizations({
                    pl: 'Wybierz rolę, dla której chcesz zmienić moc permisji.',
                })
                .setRequired(true))
            .addIntegerOption(option => option
                .setName('value')
                .setDescription('Enter permission power value you want to set')
                .setDescriptionLocalizations({
                    pl: 'Wpisz wartość mocy permiji, którą chcesz ustawić.',
                })
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('members')
            .setDescription('Edit permission power for members.')
            .setDescriptionLocalizations({
                pl: 'Edytuj moc permisji dla użytkowników.',
            })
            .addUserOption(option => option
                .setName('member')
                .setDescription('Choose member you want to change permission power.')
                .setDescriptionLocalizations({
                    pl: 'Wybierz użytkownika, któremu chcesz zmienić moc permisji.',
                })
                .setRequired(true))
            .addIntegerOption(option => option
                .setName('value')
                .setDescription('Enter permission power value you want to set')
                .setDescriptionLocalizations({
                    pl: 'Wpisz wartość mocy permiji, którą chcesz ustawić.',
                })
                .setRequired(true))),
    ephemeral: true,
    category: 'moderation',
    permPower: 10,
    logable: true,
    async execute(interaction, lang, guildcfg) {
        const permPower = interaction.options.getInteger('value');
        if (permPower < -1 || permPower > 100 || Math.round(permPower) !== permPower) return await interaction.followUp({ content: lang.commands.perms.powerValue });

        if (interaction.options.getSubcommand() === 'commands') {
            const cmd = interaction.options.getString('command');
            const { commands } = interaction.client;
            const findedcmd = commands.get(cmd);
            if (!findedcmd) return await interaction.followUp({ content: lang.commands.help.commandNotExists });

            const embed = new EmbedBuilder()
            .setTitle(lang.commands.perms.title)
            .setColor('#69BB57')
            .setFooter({ text: lang.commands.perms.footer });
            if (permPower === -1) {
                guildcfg = await guildcfgs.updateOne({ gid: interaction.guild.id }, { $unset: { [`commands.${cmd}.permPower`]: '' } });
                embed.setDescription(`> • ${lang.commands.perms.descCommand} **${cmd}**\n> • ${lang.commands.perms.descPermPower} **${lang.commands.perms.descPermPowerDeleted}**`);
            }
            else {
                guildcfg = await guildcfgs.updateOne({ gid: interaction.guild.id }, { ...guildcfg.commands, [`commands.${cmd}`]: { permPower: permPower } });
                embed.setDescription(`> • ${lang.commands.perms.descCommand} **${cmd}**\n> • ${lang.commands.perms.descPermPower} **${permPower}**`);
            }
            await interaction.followUp({ embeds: [embed] });
        }
        else if (interaction.options.getSubcommand() === 'roles') {
            const role = interaction.options.getRole('role');

            const embed = new EmbedBuilder()
            .setTitle(lang.commands.perms.title)
            .setColor('#69BB57')
            .setFooter({ text: lang.commands.perms.footer });
            if (permPower === -1) {
                guildcfg = await guildcfgs.updateOne({ gid: interaction.guild.id }, { $unset: { [`roles.${role.id}.permPower`]: '' } });
                embed.setDescription(`> • ${lang.commands.perms.descRole} **${role}**\n> • ${lang.commands.perms.descPermPower} **${lang.commands.perms.descPermPowerDeleted}**`);
            }
            else {
                guildcfg = await guildcfgs.updateOne({ gid: interaction.guild.id }, { ...guildcfg.roles, [`roles.${role.id}`]: { permPower: permPower } });
                embed.setDescription(`> • ${lang.commands.perms.descRole} **${role}**\n> • ${lang.commands.perms.descPermPower} **${permPower}**`);
            }
            await interaction.followUp({ embeds: [embed] });
        }
        else if (interaction.options.getSubcommand() === 'members') {
            const user = interaction.options.getUser('member');

            const embed = new EmbedBuilder()
            .setTitle(lang.commands.perms.title)
            .setColor('#69BB57')
            .setFooter({ text: lang.commands.perms.footer });
            if (permPower === -1) {
                guildcfg = await guildcfgs.updateOne({ gid: interaction.guild.id }, { $unset: { [`members.${user.id}.permPower`]: '' } });
                embed.setDescription(`> • ${lang.commands.perms.descUser} **${user}**\n> • ${lang.commands.perms.descPermPower} **${lang.commands.perms.descPermPowerDeleted}**`);
            }
            else {
                guildcfg = await guildcfgs.updateOne({ gid: interaction.guild.id }, { ...guildcfg.members, [`members.${user.id}`]: { permPower: permPower } });
                embed.setDescription(`> • ${lang.commands.perms.descUser} **${user}**\n> • ${lang.commands.perms.descPermPower} **${permPower}**`);
            }
            await interaction.followUp({ embeds: [embed] });
        }
    },
};