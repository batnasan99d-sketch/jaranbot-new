module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const ORDER_TOKEN = process.env.ORDER_BOT_TOKEN;
  const ORDER_CHAT_ID = process.env.ORDER_CHAT_ID || "2038932518";

  // --- TEST: https://jaranbot-new.vercel.app/api/bot?test=ID ---
  if (req.method === 'GET') {
    const url = new URL(req.url, 'https://jaranbot-new.vercel.app');
    const testChatId = url.searchParams.get('test');
    if (testChatId) {
      try {
        const targetToken = ORDER_TOKEN || TOKEN;
        const r = await fetch(`https://api.telegram.org/bot${targetToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            chat_id: testChatId, 
            text: `✅ Jaran Bot Day 5 - Ажиллаж байна!\n\n🆔 ID: ${testChatId}\n⏰ ${new Date().toLocaleString("mn-MN")}` 
          })
        });
        const data = await r.json();
        return res.status(200).json({ ok: true, test: 'sent', data });
      } catch (e) {
        return res.status(500).json({ ok: false, error: e.message });
      }
    }
    return res.status(200).send("Jaran Bot Day 5 - Working! ✅ Bot is ready for photos!");
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
    const username = msg.from?.username ? `@${msg.from.username}` : "username байхгүй";

    let reply = "";

    if (text.startsWith('/start')) {
      reply = `👋 Сайн уу ${firstName}!

Би Jaran - Монгол зургийн AI засварчин! 🇲🇳

📸 ЯАЖ АЖИЛЛАХ ВЭ?
1. Зургаа явуул (1-5 зураг)
2. Ямар болгохыг бич (ж:арын фон арилга)
3. Би захиалгыг хүлээж аваад @jaran_order_bot руу явуулна!

Дараа нь: /register - гэж бүртгүүлээрэй!

Захиалгын дугаар: ${chatId}`;
    } 
    else if (text.startsWith('/help') || text.startsWith('/register')) {
      reply = `📖 Тусламж:

Таны ID: ${chatId}
Нэр: ${firstName} ${username}

1. Зураг явуул
2. Telegram @-гаа үлдээ
3. Төлбөр төлсний дараа 8-10 хоногт бэлэн болно!

Асуух зүйл байвал: @jaran_order_bot`;
    } 
    else if (msg.photo) {
      const photo = msg.photo[msg.photo.length - 1];
      const captionText = msg.caption || "тайлбар байхгүй";

      // Захиалгыг Order Bot руу явуулах
      if (ORDER_TOKEN && ORDER_CHAT_ID) {
        const orderMsg = `📸 ШИНЭ ЗАХИАЛГА - JaranBot!

👤 Хэрэглэгч: ${firstName} ${username}
🆔 ID: ${chatId}
📝 Тайлбар: ${captionText}
⏰ ${new Date().toLocaleString("mn-MN", {timeZone: "Asia/Ulaanbaatar"})}
📷 File ID: ${photo.file_id}`;

        await fetch(`https://api.telegram.org/bot${ORDER_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: ORDER_CHAT_ID, text: orderMsg })
        });

        await fetch(`https://api.telegram.org/bot${ORDER_TOKEN}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: ORDER_CHAT_ID, photo: photo.file_id, caption: `ID: ${chatId} | ${username}` })
        });
      }

      reply = `✅ Зураг хүлээж авлаа!

📨 Таны захиалга амжилттай бүртгэгдлээ!
🆔 Дугаар: ${chatId}
👤 ${username}

💳 Төлбөр төлсний дараа ажлаа эхлэнэ!
Түр хүлээнэ үү, баярлалаа! 🙏`;
    } 
    else {
      reply = `Та "${text}" гэж бичлээ.

📸 Зураг явуулна уу?

/start - Эхлэх
/help - Тусламж`;
    }

    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply })
    });

    return res.status(200).json({ ok: true });

  } catch (e) {
    console.error("BOT ERROR:", e);
    return res.status(200).json({ ok: false, error: e.message });
  }
};
