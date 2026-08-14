module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

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
    return res.status(200).send('Jaran Bot Day 5 - Working! ✅ Use ?test=CHAT_ID or POST webhook');
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

    // ⭐ DAY 5 ШИНЭ МЭНДЧИЛГЭЭ - Энд л бүх өөрчлөлт!
    let reply;
    if (text.startsWith('/start')) {
      reply = `📸 Сайн уу ${msg.from.first_name}!

Би Jaran - Монголын Гэрэл Зургийн Орчлон! 🇲🇳

Та одоо манай 90 хоногийн аяллын Day 5 дээр нэгдлээ!

✨ Би юу хийдэг вэ?
✅ Зурагчдыг бүртгэнэ
✅ Захиалга ирэхэд шууд мэдэгдэнэ
✅ Ил тод, шударга

Дараа: /register
Тусламж: /help

Урагшаа! 🚀`;
    } else if (text.startsWith('/help')) {
      reply = `🤖 Jaran Bot Тусламж - Day 5

/register - Бүртгүүлэх (Day 8-10)
Tаны ID: ${chatId}`;
    } else if (text.startsWith('/register')) {
      reply = `📝 Бүртгэл Day 8-10 дээр нээгдэнэ!

Та бэлдээрэй:
1. Нэр
2. Утас
3. Telegram @

Түр хүлээнэ үү! 🔔`;
    } else {
      reply = `Та "${text}" гэж бичлээ.

/start - Эхлэх
/help - Тусламж`;
    }

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
