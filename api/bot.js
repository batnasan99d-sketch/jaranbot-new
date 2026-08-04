export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).send('Jaran Bot is running! POST to /api/bot');
    }
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }
    const message = body?.message || body?.edited_message;
    if (!message || !message.chat) {
      return res.status(200).send('ok');
    }
    const chatId = message.chat.id;
    const text = (message.text || message.caption || '').toString();
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) return res.status(200).send('no token');

    if (text.startsWith('/start')) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🤖 Сайн уу! Jaran Bot ажиллаж байна!\n\n✅ Group: ${message.chat.title || 'Private'}\n🆔 ID: ${chatId}`
        })
      });
    }
    return res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    return res.status(200).send('OK');
  }
}
