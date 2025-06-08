const { cmd } = require('../command');
const esana = require('@sl-code-lords/esana-news');
let activeGroups = [];
let lastSentTitle = "";

module.exports = {
  name: 'startnews',
  description: 'Send Sinhala news to groups automatically using esana-news npm',
  start: async (sock) => {
    setInterval(async () => {
      try {
        const data = await esana.getLatestNews();
        const latestNews = data[0]; // first (latest) news item

        if (latestNews.title !== lastSentTitle) {
          const message = `📰 *${latestNews.title}*\n\n${latestNews.description}\n\n📅 ${latestNews.date}`;
          lastSentTitle = latestNews.title;

          for (const groupId of activeGroups) {
            await sock.sendMessage(groupId, { text: message });
          }
        }
      } catch (err) {
        console.log("❌ News Fetch Error:", err.message);
      }
    }, 1000 * 60 * 5); // every 5 minutes
  },

  command: ['startnews', 'stopnews'],
  handler: async (msg, sock) => {
    const groupId = msg.key.remoteJid;

    if (!groupId.endsWith('@g.us')) {
      return await sock.sendMessage(groupId, { text: "⛔ මෙම command එක group එකක පමණක් භාවිතා කරන්න." });
    }

    if (msg.body.startsWith('/startnews')) {
      if (!activeGroups.includes(groupId)) {
        activeGroups.push(groupId);
        await sock.sendMessage(groupId, { text: "🟢 Auto news service සක්‍රීයයි!" });
      } else {
        await sock.sendMessage(groupId, { text: "🔄 News service දැනටමත් ක්‍රියාත්මකයි." });
      }
    }

    if (msg.body.startsWith('/stopnews')) {
      activeGroups = activeGroups.filter(g => g !== groupId);
      await sock.sendMessage(groupId, { text: "🔴 Auto news service නවතා ඇත." });
    }
  }
};
