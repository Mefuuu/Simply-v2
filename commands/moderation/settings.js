const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const guildcfgs = require('../../schemas/guildcfg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Detailed list of settings.')
        .setDescriptionLocalizations({
            pl: 'Szczegółowa lista ustawień.',
        })
        .addSubcommand(subcommand => subcommand
            .setName('permissions')
            .setDescription('Permission list for commands, roles and members.')
            .setDescriptionLocalizations({
                pl: 'Lista permisji dla komend, ról i użytkowników.',
            }))
        .addSubcommand(subcommand => subcommand
            .setName('language')
            .setDescription('Change the display language.')
            .setDescriptionLocalizations({
                pl: 'Zmień język wyświetlania.',
            })
            .addStringOption(option => option
                .setName('lang')
                .setDescription('Choose language.')
                .setDescriptionLocalizations({
                    pl: 'Wybierz język.',
                })
                .setRequired(true)
                .addChoices(
                    { name: 'Polski (Polish 🇵🇱)', value: 'pl' },
                    { name: 'English (🇬🇧)', value: 'en' },
                )))
        .addSubcommand(subcommand => subcommand
            .setName('verify')
            .setDescription('Displays the current verification system settings.')
            .setDescriptionLocalizations({
                pl: 'Wyświetla aktualnie ustawienia systemu weryfikacji.',
            })),
    ephemeral: true,
    category: 'moderation',
    permPower: 10,
    logable: false,
    async execute(interaction, lang, guildcfg) {
        if (interaction.options.getSubcommand() === 'permissions') {
            let p1 = '';
            if (guildcfg.commands) {
                for (const command in guildcfg.commands) {
                    p1 += `> \`/${command}\` -> **${guildcfg.commands[command].permPower}**\n`;
                }
            }
            let p2 = '';
            if (guildcfg.roles) {
                for (const role in guildcfg.roles) {
                    p2 += `> <@&${role}> -> **${guildcfg.roles[role].permPower}**\n`;
                }
            }
            let p3 = '';
            if (guildcfg.members) {
                for (const member in guildcfg.members) {
                    p3 += `> <@${member}> -> **${guildcfg.members[member].permPower}**\n`;
                }
            }
            if (p1 === '') p1 = `> ${lang.commands.settings.permsNoData}`;
            if (p2 === '') p2 = `> ${lang.commands.settings.permsNoData}`;
            if (p3 === '') p3 = `> ${lang.commands.settings.permsNoData}`;
            const embed = new EmbedBuilder()
            .setTitle(`${lang.commands.settings.permsTitle} ${interaction.guild.name}`)
            .setColor('#69BB57')
            .setThumbnail(interaction.guild.iconURL())
            .addFields(
                { name: lang.commands.settings.permsFieldCommands, value: p1 },
                { name: lang.commands.settings.permsFieldRoles, value: p2 },
                { name: lang.commands.settings.permsFieldUsers, value: p3 },
            );
            await interaction.followUp({ embeds: [embed] });
        }
        else if (interaction.options.getSubcommand() === 'language') {
            const language = interaction.options.getString('lang');
            guildcfg = await guildcfgs.updateOne({ gid: interaction.guild.id }, { lang: language });
            const lang2 = require(`../../data/locale/${language}.json`);
            const embed = new EmbedBuilder()
            .setDescription(`✅ **${lang2.langChange}**`)
            .setColor('#69BB57');
            await interaction.followUp({ embeds: [embed] });
        }
        else if (interaction.options.getSubcommand() === 'verify') {
            if (guildcfg.verify) {
                await interaction.followUp({ content: 'Soon...' });
            }
            else {
                await interaction.followUp({ content: lang.commands.settings.noVerify });
            }
        }
    },
};