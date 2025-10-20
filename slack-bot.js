require('dotenv').config();
const { App } = require('@slack/bolt');

const bot = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

async function postAnnouncement(text, date) {
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "New Announcement :siren-real:",
        emoji: true
      }
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Date:*\n${date}`
        },
      ]
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: text
      }
    }
  ];


  blocks.push({ type: "divider" });

  try {
    await bot.client.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      blocks: blocks
    });
    console.log('Message posted to Slack successfully');
    return true;
  } catch (error) {
    console.error('Error posting to Slack:', error);
    throw error;
  }
}

(async () => {
  await bot.start(process.env.SLACK_PORT);
  console.log('Slack bot is running!');
})();

module.exports = { postAnnouncement };
