const Telegraf = require('telegraf')
const session = require('telegraf/session')

const Telegram = require('telegraf/telegram')

const { token } = require('./token')
const static = require('./static')
const RelayTo = `-331862815` // chat id of the admin group

const bot = new Telegraf(token)
const telegram = new Telegram(token)
// // Register session middleware
bot.use(session())

// Register logger middleware
bot.use(async (ctx, next) => {
  const start = new Date()
  
  // send reply from admin group
  if (ctx.message.chat.id  == RelayTo && 
      ctx.message.reply_to_message &&
      ctx.message.reply_to_message.text.split(',')[0].split(':')[0].trim() === 'Chat id' &&
      ctx.message.reply_to_message.text.split(',')[2].split(':')[0].trim() === 'Message id') 
      {
    const from = ctx.message.from.username
    const text = '<' + from + '> ' + ctx.message.text
    const to = ctx.message.reply_to_message.text.split(',')[0].split(':')[1].trim()
    const inReplyTo = ctx.message.reply_to_message.text.split(',')[2].split(':')[1].trim()

    await telegram.sendMessage(to, text, {
      reply_to_message_id: inReplyTo,
      disable_web_page_preview: true
    })
  }
  return next().then(() => {
    const ms = new Date() - start
    console.log('response time %sms', ms)
  })
})

bot.hears(/sendTo (.+)/, ({ match, reply }) => {
  console.log(match)
  const chatId = match[1].split(',')[0].trim()
  const text = match[1].split(',')[1].trim()
  telegram.sendMessage(chatId, text, {
    disable_web_page_preview: true
  })
})

bot.command('documentation', (ctx) => {
  telegram.sendMessage(ctx.message.chat.id, static.documentation, {
    disable_web_page_preview: true
  })
})

bot.command('help', (ctx) => {
  text = static.help
  if (ctx.message.chat.id == RelayTo) {
    text = static.adminHelp
  }
  telegram.sendMessage(ctx.message.chat.id, text, {
    disable_web_page_preview: true,
    parse_mode: 'MarkdownV2'
  })
})

bot.command('query', async (ctx) => {
  console.log(ctx.message)
  const chat = ctx.message.chat.title;
  const text = ctx.message.text.substring(6);

  const fromChatId = ctx.message.chat.id;
  const messageId = ctx.message.message_id;

  await telegram.sendMessage(fromChatId, 'Relayed your query! 🤵🏻', {
    reply_to_message_id: messageId
  })
  return telegram.sendMessage(RelayTo, `Chat id: \`${ctx.message.chat.id},\` \nChat title: \*${ctx.message.chat.title},\* \nMessage id: \` ${messageId}\`, \nUser: \`@${ctx.message.from.username},\` \n\nQuery: \`${text}\` `, {
    parse_mode: 'MarkdownV2'
  })
})

// Launch bot
bot.launch()