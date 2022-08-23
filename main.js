
const { Client, GatewayIntentBits, InteractionResponse } = require('discord.js');
const { token } = require('./config.json');
const { scraper } = require('./scraper/scrape')
const autoPostConfig = require('./autopost.json')
const fs = require("fs");

// Create a new client instance

const setAutoMessage = (client, clientId, delay, frequency, setTime) => {
    let currentTime = Date.now()
    if (setTime + delay < currentTime) {
        delay = frequency - (currentTime - (setTime + delay)) % frequency
    } else {
        delay = setTime + delay - currentTime
    }
    // console.log(delay)

    setTimeout(() => {
        scraper().then((a) => {
            client.channels.cache.get(clientId).send(`${a[0]} \n${a[1]} \n ${a[2]}\n @everyone`)
        })
        setInterval(() => {
            scraper().then((a) => {
                client.channels.cache.get(clientId).send(`${a[0]} \n${a[1]} \n ${a[2]}\n @everyone`)
            })
        }, frequency);

    }, delay);
}


const saveAutopost = (clientId, delay, frequency, setTime) => {
    autoPostConfig[clientId] = {
        delay: delay,
        frequency: frequency,
        setTime: setTime
    }
    let configString = JSON.stringify(autoPostConfig, null, 2);
    fs.writeFile('autopost.json', configString, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
}




const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
    for (channelId in autoPostConfig) {
        setAutoMessage(
            client,
            channelId,
            autoPostConfig[channelId].delay,
            autoPostConfig[channelId].frequency,
            autoPostConfig[channelId].setTime)
    }
});

client.on('interactionCreate', async interaction => {
    // console.log(interaction)
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply(' ');
    } else if (commandName === 'server') {
        await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
    } else if (commandName === 'user') {
        await interaction.reply('User info.');
    } else if (commandName === 'gasinfo') {
        let a = await scraper()
        await interaction.reply(`${a[0]} \n${a[1]} ${a[2]}\n`);
    } else if (commandName === 'setautopost') {
        let frequency = interaction.options.getNumber('frequency');
        let delay = interaction.options.getNumber('delay');
        frequency = frequency * 3600000
        delay = delay * 3600000
        const channelInfo = interaction.member.guild.systemChannelId
        saveAutopost(channelInfo, delay, frequency, Date.now())
        setAutoMessage(client, channelInfo, delay, frequency, Date.now())
        await interaction.reply({ content: 'Success!', ephemeral: true })
        // await interaction.reply();

    }
});

// Login to Discord with your client's token
client.login(token);
