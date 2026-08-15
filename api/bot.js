module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const ORDER_TOKEN = process.env.ORDER_BOT_TOKEN;
  const ORDER_CHAT_ID = process.env.ORDER_CHAT_ID;

  // --- TEST MODE (?test=ID) ---
  if (req.method === 'GET') {
    const url = new URL(req.url, 'https://jaranbot-new.vercel.app');
    const testChatId = url.searchParams.get('test');
    if (testChatId && ORDER_TOKEN) {
      try {
        const r = await fetch(`https://api.telegram.org/bot${ORDER_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: testChatId, text: `✅ Vercel-ээс шууд тест! Bot ажиллаж байна!\n\nID: ${testChatId}\nTime: ${new Date().toLocaleString()}` })
        });
        const data = await r.json();
        return res.status(200).json({ ok: true, test: 'sent', tg_response: data });
      } catch (e) {
        return res.status(500).json({ ok: false, error: e.message });
      }
    }
    return res.status(200).send("Jaran Bot Day 5 - Working! ✅ Use ?test=CHAT_ID or POST webhook");
  }

  // --- TELEGRAM WEBHOOK ---
  try {
    let body = req.body;
    if (!body) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString();
      try { body = JSON.parse(raw); } catch { body = {}; }
    }
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch {} }

    const msg = body.message || body.edited_message;
    if (!msg) return res.status(200).send('ok no msg');
    const chatId = msg.chat.id;
    const text = msg.text || "";
    const firstName = msg.from?.first_name || "найз";

    let reply = "";

    if (text.startsWith('/start')) {
      reply = `👋 Сайн уу ${firstName}!\n\nБи Jaran - Монголын Гарал Зургийн Орон! 🇲🇳\n\n📸 Зургаа явуулаарай! Би:\n✨ Зургийг чинь гоё болгоно\n✨ Арын фоныг арилгана\n✨ Чанарыг сайжруулна\n\nДараа нь /register гэж бүртгүүлээд захиалгаа баталгаажуулна уу!`;
    } else if (text.startsWith('/help')) {
      reply = `📖 Jaran Bot Тусламж - Day 5\n\n/register - Бүртгүүлэх (8-10 хоногт гарна)\nТаны ID: ${chatId}\n\nЗаавар:\n1. /start\n2. Зураг явуул\n3. Telegram @-гаа үлдээ\n\nТүр хүлээнэ үү! ⏳`;
    } else if (text.startsWith('/register')) {
      reply = `✅ Бүртгэл Day 8-10 дээр гарна!\nТаны ID: ${chatId}\n\n📝 Одоо зургаа явуулаад, Telegram @-гаа бичээрэй!`;
    } else if (msg.photo) {
      // Фото хүлээж авлаа -> Order bot руу дамжуулах
      const photo = msg.photo[msg.photo.length - 1]; // хамгийн том хэмжээ
      const caption = `📸 ШИНЭ ЗАХИАЛГА!\n\n👤 Хэрэглэгч: ${firstName} (@${msg.from?.username || 'no username'})\n🆔 Chat ID: ${chatId}\n📷 File ID: ${photo.file_id}\n⏰ ${new Date().toLocaleString('mn-MN')}\n\n💬 Тайлбар: ${msg.caption || 'байхгүй'}`;
      
      // Order bot руу явуулах
      if (ORDER_TOKEN && ORDER_CHAT_ID) {
        await fetch(`https://api.telegram.org/bot${ORDER_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: ORDER_CHAT_ID, text: caption })
        });
        // Зургийг нь бас forward хийх (file_id-р)
        await fetch(`https://api.telegram.org/bot${ORDER_TOKEN}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: ORDER_CHAT_ID, photo: photo.file_id, caption: `Хэрэглэгч: ${chatId}` })
        });
      }

      reply = `✅ Хүлээж авлаа: Фото!\n\n📨 Захиалга @jaran_order_bot руу очлоо!\n💳 Төлбөрөө хийсний дараа 8-10 хоногт бэлэн болно!\n\nТа Telegram @-гаа бичиж үлдээгээрэй!`;
    } else {
      reply = `Та "${text}" гэж бичлээ.\n\n📸 Зураг явуулна уу?\n\n/start - Эхлэх\n/help - Тусламж`;
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply })
    });
    const data = await tgRes.json();
    return res.status(200).json({ ok: true, sent: data });

  } catch (e) {
    console.error(e);
    return res.status(200).json({ ok: false, error: e.message });
  }
};
