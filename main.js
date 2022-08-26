
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
    console.log(delay)

    setTimeout(() => {
        scraper().then((a) => {
            client.user.setPresence({ activities: [{ name: `${a[3]}` }], status: 'idle' });
            client.channels.cache.get(clientId).send(`${a[0]} \n${a[1]} \n ${a[2]}\n`)
        })
        setInterval(() => {
            scraper().then((a) => {
                client.user.setPresence({ activities: [{ name: `${a[3]}` }], status: 'idle' });
                client.channels.cache.get(clientId).send(`${a[0]} \n${a[1]} \n ${a[2]}\n`)
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
client.once('ready', async () => {
    let a = await scraper()
    client.user.setPresence({ activities: [{ name: `${a[3]}` }], status: 'idle' });
    lastCheckDate = ""
    setInterval(async () => {
        let a = await scraper()
        client.user.setPresence({ activities: [{ name: `${a[3]}` }], status: 'idle' });
        if (a[4] !== lastCheckDate && lastCheckDate.length !== 0) {
            for (channelId in autoPostConfig) {
                client.channels.cache.get(clientId).send(`${a[0]} \n${a[1]} \n ${a[2]}\n`)
            }
        }
        lastCheckDate = a[4]
    }, 900 * 1000);
    // for (channelId in autoPostConfig) {
    //     setAutoMessage(
    //         client,
    //         channelId,
    //         autoPostConfig[channelId].delay,
    //         autoPostConfig[channelId].frequency,
    //         autoPostConfig[channelId].setTime)
    // }
});

client.on('interactionCreate', async interaction => {
    // console.log(interaction)
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply(' ');
    } else if (commandName === 'server') {
        console.log(interaction)
        await interaction.reply(`Server name: ${interaction.guild.name} ${interaction.channelId}\nTotal members: ${interaction.guild.memberCount}`);
    } else if (commandName === 'user') {
        await interaction.reply('User info.');
    } else if (commandName === 'gasinfo') {
        let a = await scraper()
        client.user.setPresence({ activities: [{ name: `${a[3]}` }], status: 'idle' });
        await interaction.reply(`${a[0]} \n${a[1]} ${a[2]}\n`);
    } else if (commandName === 'setautopost') {
        let frequency = interaction.options.getNumber('frequency');
        let delay = interaction.options.getNumber('delay');
        frequency = frequency * 3600000
        delay = delay * 3600000
        const channelInfo = interaction.channelId
        saveAutopost(channelInfo, delay, frequency, Date.now())
        setAutoMessage(client, channelInfo, delay, frequency, Date.now())
        await interaction.reply({ content: 'Success!', ephemeral: true })
        // await interaction.reply();

    }
});

// Login to Discord with your client's token
client.login(token);
