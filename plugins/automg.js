const config = require('../config');
const { cmd, commands } = require('../command');

// Store user cooldowns in memory
const userCooldowns = new Map();

// Auto reply messages array
const autoReplyTexts = [
    "Hello! Thanks for your message. I'll get back to you soon! 😊",
    "Hi there! I received your message. Will respond shortly! 👋",
    "Thanks for reaching out! I'll reply as soon as possible! 💫",
    "Hello! Your message is important to me. Please wait for my response! 🌟",
    "Hi! I got your message. I'll get back to you in a moment! ✨",
    "Thank you for your message! I'll respond soon! 🙏",
    "Hey! Message received. I'll reply shortly! 🚀",
    "Hello there! Thanks for contacting me. Response coming soon! 💝"
];

// Auto reply voice messages array (you can add voice file URLs or base64 encoded audio)
const autoReplyVoices = [
    "https://files.catbox.moe/bi1p2z.mp3"          // Replace with actual voice file URLs
    
    // Add more voice messages as needed
];

// Function to check if user is in cooldown
function isInCooldown(userId) {
    const lastReply = userCooldowns.get(userId);
    if (!lastReply) return false;
    
    const now = Date.now();
    const cooldownTime = 10 * 60 * 1000; // 10 minutes in milliseconds
    
    return (now - lastReply) < cooldownTime;
}

// Function to set user cooldown
function setCooldown(userId) {
    userCooldowns.set(userId, Date.now());
}

// Auto reply handler for all messages
cmd({
    on: "text", // This will trigger for all text messages
    filename: __filename
},
async (conn, mek, m, { from, sender, body, isGroup, isOwner, isMe }) => {
    try {
        // Don't reply to:
        // - Bot's own messages
        // - Owner messages (optional)
        // - Group messages (you can remove this if you want group auto replies)
        // - Command messages (starting with prefix)
        if (isMe || isOwner || isGroup || body.startsWith(config.PREFIX)) {
            return;
        }

        // Check if user is in cooldown
        if (isInCooldown(sender)) {
            return; // Don't send auto reply
        }

        // Randomly choose between text and voice (50-50 chance)
        const sendVoice = Math.random() < 0.5;
        
        if (sendVoice && autoReplyVoices.length > 0) {
            // Send random voice message
            const randomVoice = autoReplyVoices[Math.floor(Math.random() * autoReplyVoices.length)];
            
            await conn.sendMessage(from, {
                audio: { url: randomVoice },
                mimetype: 'audio/mp4',
                ptt: true // This makes it a voice note
            });
        } else {
            // Send random text message
            const randomText = autoReplyTexts[Math.floor(Math.random() * autoReplyTexts.length)];
            
            await conn.sendMessage(from, {
                text: randomText,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363354023102228@newsletter',
                        newsletterName: "ᴅ-xᴛʀᴏ ᴀᴜᴛᴏ ʀᴇᴘʟʏ",
                        serverMessageId: 143
                    }
                }
            });
        }

        // Set cooldown for this user
        setCooldown(sender);

    } catch (e) {
        console.error("Error in auto reply:", e);
    }
});

// Command to check auto reply status
cmd({
    pattern: "getreply",
    desc: "Check auto reply status and cooldown",
    category: "main",
    react: "💬",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const isInCooldownStatus = isInCooldown(sender);
        const lastReply = userCooldowns.get(sender);
        
        let statusText = "📱 *AUTO REPLY STATUS* 📱\n\n";
        
        if (isInCooldownStatus && lastReply) {
            const now = Date.now();
            const timePassed = now - lastReply;
            const cooldownTime = 10 * 60 * 1000; // 10 minutes
            const timeLeft = cooldownTime - timePassed;
            const minutesLeft = Math.ceil(timeLeft / (60 * 1000));
            
            statusText += `🔴 *Status:* Cooldown Active\n`;
            statusText += `⏰ *Time Left:* ${minutesLeft} minutes\n`;
            statusText += `📝 *Last Reply:* ${new Date(lastReply).toLocaleTimeString()}\n\n`;
            statusText += `ℹ️ Auto reply will work again after ${minutesLeft} minutes.`;
        } else {
            statusText += `🟢 *Status:* Ready for Auto Reply\n`;
            statusText += `✅ *Next Message:* Will get auto reply\n\n`;
            statusText += `ℹ️ Send any message to get an auto reply!`;
        }
        
        await reply(statusText);
        
    } catch (e) {
        console.error("Error in getreply command:", e);
        reply(`Error: ${e.message}`);
    }
});
