module.exports = async (req, res) => {
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8897676749:AAEu6VBmiASmgSHfrkAgRkeS0jPFce6ZO1s';
  if (req.method !== 'POST') {
    return res.status(200).send('Jaran Bot is running! Fix applied v2! TOKEN: ' + (process.env.TELEGRAM_BOT_TOKEN ? 'OK' : 'MISSING'));
  }
  try {
    let body = req.body;
    // Vercel sometimes doesn't parse body
    if (!body) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString();
      try { body = JSON.parse(raw); } catch { body = {}; }
    } else if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }

    const msg = body.message || body.edited_message;
    if (!msg || !msg.text) {
      return res.status(200).send('ok - no text');
    }
    const chatId = msg.chat.id;
    const text = msg.text;
    let reply = text.startsWith('/start') 
      ? '🤖 Сайн уу! Jaran Bot АЖИЛЛАЖ БАЙНА! 🎉\n\nID: ' + chatId + '\nБэлэн боллоо!' 
      : 'Та "' + text + '" гэж бичлээ.';

    const r = await fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: chatId, text: reply})
    });
    const data = await r.json();
    console.log('TG SEND:', JSON.stringify(data));
    return res.status(200).json({ok: true, tg: data});
  } catch(e) {
    console.error('ERR:', e);
    return res.status(200).send('ok err: ' + e.message);
  }
};
