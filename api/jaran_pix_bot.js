export default async function handler(req, res) {
  // Browser-аар ороход ok гэж харуулна
  if (req.method === 'GET') {
    return res.status(200).send('ok - bot is running');
  }

  try {
    
    const body = req.body;
    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!body || !body.message) {
      return res.status(200).send('no message');
    }

    const chatId = body.message.chat.id;
    const text = body.message.text || "";
    const username = body.message.from?.username || "user";

    let replyText = "";
    
    if (text === "/start") {
      replyText = "🎉 БОЛЛОО! Сайн уу! 📸\n\nЖаран архив bot амжилттай ажиллаж байна!\n\nӨдрөө бич: 2026-08-15 14:00";
    } else {
      replyText = "✅ Хүлээн авлаа: " + text + "\n\nЗахиалга @jaran_order_bot руу очлоо!";
    }

    // Telegram руу хариу явуулах
    const tgRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText
      })
    });

    const tgData = await tgRes.json();
    console.log("Telegram response:", tgData);

    return res.status(200).json({ ok: true, telegram: tgData });
    
  } catch (err) {
    console.error(err);
    return res.status(200).send('error but ok: ' + err.message);
  }
}
