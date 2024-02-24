const dotenv = require('dotenv')
dotenv.config()

const axios = require('axios')

// html decoder
const he = require('he')


const express = require('express')
const cors = require('cors')


const server = express()

server.use(express.json())
server.use(cors)



const { REST, Routes, Client, GatewayIntentBits, InteractionType, Embed, AttachmentBuilder} = require('discord.js') ;
const { EmbedBuilder, SlashCommandBuilder} = require('@discordjs/builders')




// setting slash commands



// weird work around using the slashCommandBuilder class for the gif slash command. I didn't feel like looking up how to build it as an object since the string option threw me off
const gifCommand = new SlashCommandBuilder()
.setName('gif')
.setDescription('Return a random gif with the option of a genre tag')
.addStringOption(option => 
    option
    .setName('tag')
    .setDescription('Name of the tag')
    .setRequired(false)
  )

const commands = [
    {
      name: 'ping',
      description: 'Replies with Pong!',
    },
    {
        name:'quiz',
        description:'Retrieves a random set of quiz questions'
    },
    gifCommand
  ];





  async function setCommands  () {
    const rest = new REST({ version: '10' }).setToken(process.env.CLIENT_TOKEN);
  
  try {
    console.log('Started refreshing application (/) commands.');
  
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

setCommands()
  



//   setting bot to listen and respond to commands
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.MessageContent] });

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);


});

// new member added to the discord
client.on('guildMemberAdd', async newMember => {
    const channel = newMember.guild.channels.cache.find(channel => channel.name === 'general')
    if(!channel) return;
    try {
        const welcomeImage = new AttachmentBuilder('imgs/welcomeImgs/lotusWelcome.jpg')


        const embededMessage = new EmbedBuilder()
        .setTitle("A poor soul has joined!")
        .setDescription(`Welcome ${newMember.user.globalName}! We hope you don't regret the decision to have joined!`)
        .setImage('attachment://lotusWelcome.jpg')
    
        console.log(newMember)
    
        await channel.send({embeds: [embededMessage], files: [welcomeImage]})    
    } catch (error) {
        console.log(error)
    }
    
    
    
})

// if message contains key word

client.on('messageCreate', async message => {
    message.content = message.content.toLowerCase()


    // auto response for the key word "enshrouded"
    if(message.content.includes('enshrouded')){
        const attachment = new AttachmentBuilder('https://assets-prd.ignimgs.com/2023/05/03/enshrouded-1683151796116.jpg')
        console.log(message)
        try {
           message.reply({content: `Is this what you're looking for??`, files: [attachment]})
        
        } catch (error) {
            console.log(error)
        }
    }

    // auto response for the key word "creeper"
    if(message.content.includes('creep')){

      const attachment = new AttachmentBuilder('https://media.giphy.com/media/NM4HoYcdbXdLO/giphy.gif')
        console.log(message)

      try {
          message.reply({files: [attachment]})
      } catch (error) {
        // "debugging"
        console.log(error)
      }
    }


    // auto response for the key words "minecraft"
    if(message.content.includes('minecraft')){

      const attachment = new AttachmentBuilder('https://i.makeagif.com/media/10-05-2016/mUtK5h.gif')
        console.log(message)

      try {
          message.reply({content: 'Moinecruft???', files: [attachment]})
      } catch (error) {
        // "debugging"
        console.log(error)
      }
    }
})


// slash command responses
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;


  switch (interaction.commandName) {
    case 'ping':
        console.log(interaction)
        await interaction.reply(`Pong... This is probably the lamest command you could've asked me to do`)
    
        break;
    
    case 'quiz':
        const quiz = await axios.get('https://opentdb.com/api.php?amount=1&type=boolean').then(res => res.data)
        
        console.log(quiz.results[0])

        

        await interaction.reply(he.decode(quiz.results[0].question))
        
        const question = quiz.results[0]
        const filter = m => m.author.id === interaction.member.user.id
        const answer = await interaction.channel.awaitMessages({filter, maxMatches: 1,time: 10000})
        
        if(!answer.first()){
          interaction.followUp("YOU TOOK TOO DAMN LONG")
        }else{
          const ans = answer.first()
        
        

          if(ans.content.toLowerCase() === question.correct_answer.toLowerCase()){
              await ans.reply("THAT WAS CORRECT")
          }else{
              await ans.reply("THAT WAS INCORRECT")
          }
        }

        


        break;
    
    case 'gif':

        try {
          // loading in the tag option if it exists, otherwised make it null
          const tagOption = interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].value : null 
          console.log(tagOption)
          // getting the gif url to prep it send on discord
          const gif = await axios.get(`https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_KEY}&tag=${tagOption}&rating=r`).then(res => res.data.data.images.original.webp)
          
          
          // sending a goofy reply with the follow up reply being the gif itself
          await interaction.reply({content:'Here is your gif you filthy animal'})
          await interaction.followUp({content:gif})  
        } catch (error) {
          // "debugging"
          console.log(error)
        }
        
        break;

    default:
        break;
  }


});



client.login(process.env.CLIENT_TOKEN);










module.exports = server