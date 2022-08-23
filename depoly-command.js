const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, token } = require('./config.json');

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
    new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
    new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
    new SlashCommandBuilder().setName('gasinfo').setDescription('Replies with the latet gas!'),
    new SlashCommandBuilder().setName('setautopost').setDescription('Set the auto post in the current channel!')
        .addNumberOption(option => option.setName('frequency').setDescription('Frequecny of the auto posting, in unit of hour ex: 1.5 means 1hour30min').setRequired(true))
        .addNumberOption(option => option.setName('delay').setDescription('Delay the time you want til start auto posting, in unit of hour ex: 1.5 means 1hour30min').setRequired(true)),
    new SlashCommandBuilder().setName('removeautopost').setDescription('Removes the autopost from the current channel'),
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);