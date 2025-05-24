const { Esana } = require('esana-node-api');
const adaderana = require('adaderana-scraper');
const esanaScraper = require('esana-news-scraper');

const activeGroups = new Set();

async function fetchNews() {
  try {
    const esanaData = await Esana.fetch_news_data();
    if (esanaData?.esana?.title) {
      return formatNews(esanaData.esana.title, esanaData.esana.url);
    }
  } catch {}

  try {
    const adaderanaNews = await adaderana.getLatestNews();
    if (adaderanaNews?.length > 0) {
      const news = adaderanaNews[0];
      return formatNews(news.title, news.link);
    }
  } catch {}

  try {
    const esanaNews = await esanaScraper.getLatestNews();
    if (esanaNews?.length > 0) {
      const news = esanaNews[0];
      return formatNews(news.title, news.link);
    }
  } catch {}

  return '*NEWS ALERT*\nපුවත් ලබා ගැනීම අසාර්ථකයි.\n> ©MR DINESH OFC';
}

function formatNews(title, url) {
  return `*NEWS ALERT*\n📰 ${title}\n🔗 ${url}\n> ©MR DINESH OFC`;
}

function handleCommand(message, groupId, sendMessage) {
  const command = message.trim().toLowerCase();
  if (command === '/startnews') {
    activeGroups.add(groupId);
    sendMessage(groupId, '🟢 AUTO NEWS ACTIVE THIS GROUP');
  } else if (command === '/stopnews') {
    activeGroups.delete(groupId);
    sendMessage(groupId, '🔴 CLOSE AUTO SEND NEWS');
  } else if (command === '/getnews') {
    fetchNews().then(news => {
      sendMessage(groupId, news);
    });
  }
}

function startNewsInterval(sendMessage) {
  setInterval(async () => {
    const news = await fetchNews();
    for (const groupId of activeGroups) {
      sendMessage(groupId, news);
    }
  }, 15 * 60 * 1000); // 15 minutes
}

module.exports = {
  handleCommand,
  startNewsInterval
};
