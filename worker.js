export default {
  async fetch(request, env, ctx) {
    const TOKEN = env.TELEGRAM_BOT_TOKEN;
    const ORDER_TOKEN = env.ORDER_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN;
    const ORDER_CHAT_ID = env.ORDER_CHAT_ID || "2038932518";

    const url = new URL(request.url);

    // --- TEST: /?test=ID ---
    if (request.method === 'GET') {
      const testChatId = url.searchParams.get('test');
      if (testChatId) {
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
        return new Response(JSON.stringify({ ok: true, test: 'sent', data }), { headers: { 'Content-Type': 'application/json' } });
      }
      return new Response("Jaran Bot Day 5 - Working! ✅ Bot is ready for photos!");
    }

    // --- WEBHOOK ---
    try {
      let body = await request.json().catch(() => ({}));
      if (typeof body === 'string') try { body = JSON.parse(body); } catch {}

      const msg = body.message || body.edited_message;
      if (!msg) return new Response('ok no msg');

      const chatId = msg.chat.id;
      const text = msg.text || "";
      const firstName = msg.from?.first_name || "найз";
      const username = msg.from?.username? `@${msg.from.username}` : "username байхгүй";
      let reply = "";

      if (text.startsWith('/start')) {
        reply = `👋 Сайн уу ${firstName}!\n\nБи Jaran - Монгол зургийн AI засварчин! 🇲🇳\n\n📸 ЯАЖ АЖИЛЛАХ ВЭ?\n1. Зургаа явуул (1-5 зураг)\n2. Ямар болгохыг бич (ж:арын фон арилга)\n3. Би захиалгыг хүлээж аваад @jaran_order_bot руу явуулна!\n\nДараа нь: /register - гэж бүртгүүлээрэй!\n\nЗахиалгын дугаар: ${chatId}`;
      } else if (text.startsWith('/help') || text.startsWith('/register')) {
        reply = `📖 Тусламж:\n\nТаны ID: ${chatId}\nНэр: ${firstName} ${username}\n\n1. Зураг явуул\n2. Telegram @-гаа үлдээ\n3. Төлбөр төлсний дараа 8-10 хоногт бэлэн болно!\n\nАсуух зүйл байвал: @jaran_order_bot`;
      } else if (msg.photo) {
        const photo = msg.photo[msg.photo.length - 1];
        const captionText = msg.caption || "тайлбар байхгүй";

        if (ORDER_TOKEN && ORDER_CHAT_ID) {
          const orderMsg = `📸 ШИНЭ ЗАХИАЛГА - JaranBot!\n\n👤 Хэрэглэгч: ${firstName} ${username}\n🆔 ID: ${chatId}\n📝 Тайлбар: ${captionText}\n⏰ ${new Date().toLocaleString("mn-MN", {timeZone: "Asia/Ulaanbaatar"})}\n📷 File ID: ${photo.file_id}`;
          await fetch(`https://api.telegram.org/bot${ORDER_TOKEN}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: ORDER_CHAT_ID, text: orderMsg })
          });
          await fetch(`https://api.telegram.org/bot${ORDER_TOKEN}/sendPhoto`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: ORDER_CHAT_ID, photo: photo.file_id, caption: `ID: ${chatId} | ${username}` })
          });
        }
        reply = `✅ Зураг хүлээж авлаа!\n\n📨 Таны захиалга амжилттай бүртгэгдлээ!\n🆔 Дугаар: ${chatId}\n👤 ${username}\n\n💳 Төлбөр төлсний дараа ажлаа эхлэнэ!\nТүр хүлээнэ үү, баярлалаа! 🙏`;
      } else {
        reply = `Та "${text}" гэж бичлээ.\n\n📸 Зураг явуулна уу?\n\n/start - Эхлэх\n/help - Тусламж`;
      }

      await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: reply })
      });

      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 200 });
    }
  }
}
