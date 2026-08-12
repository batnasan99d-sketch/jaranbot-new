module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8897676749:AAEu6VBmiASmgSHfrkAgRkeS0jPFce6ZO1s';
  
  if (req.method === 'GET') {
    const url = new URL(req.url, 'https://jaranbot-new.vercel.app');
    const testChatId = url.searchParams.get('test');
    if (testChatId) {
      try {
        const r = await fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({chat_id: testChatId, text: '✅ Vercel-ээс шууд тест! Bot ажиллаж байна! 🎉'})
        });
        const data = await r.json();
        return res.status(200).json({ok: true, test: 'sent', tg_response: data});
      } catch(e) {
        return res.status(500).json({ok: false, error: e.message});
      }
    }
    return res.status(200).send('Jaran Bot v3 Ready! TOKEN: OK | Use ?test=CHAT_ID');
  }

  try {
    let body = req.body;
    if (!body) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString();
      try { body = JSON.parse(raw); } catch { body = {}; }
    } else if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }
    const msg = body.message || body.edited_message;
    if (!msg || !msg.text) return res.status(200).send('ok no msg');
    const chatId = msg.chat.id;
    const text = msg.text;
    let reply = text.startsWith('/start') ? '🤖 САЙН УУ! ЭЦЭСТ НЬ АЖИЛЛАА! 🎉 ID: ' + chatId : 'Та "' + text + '" гэж бичлээ.';
    const r = await fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: chatId, text: reply})
    });
    const data = await r.json();
    return res.status(200).json({ok: true, sent: data});
  } catch(e) {
    return res.status(200).json({ok: false, error: e.message});
  }
};
