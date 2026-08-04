export default async function handler(req, res) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  console.log('METHOD:', req.method, 'TOKEN EXISTS:', !!token);
  console.log('BODY:', JSON.stringify(req.body).slice(0,500));
  
  if (req.method !== 'POST') {
    return res.status(200).send('Jaran Bot is running! POST to /api/bot');
  }
  
  try {
    const update = req.body;
    const msg = update.message || update.edited_message;
    if (!msg || !msg.text) return res.status(200).send('ok');
    
    const chatId = msg.chat.id;
    const text = msg.text;
    const name = msg.chat.title || msg.from.first_name || 'Найз';
    
    let reply = `🤖 Сайн уу ${name}!\n\n✅ Jaran Bot ажиллаж байна!\n🆔 ID: ${chatId}\nТа "${text}" гэж бичлээ.`;
    if (text.startsWith('/start')) {
      reply = `🤖 Сайн уу! Jaran Bot ажиллаж байна!\n\n✅ Chat: ${name}\n🆔 ID: ${chatId}\n\nБэлэн боллоо! 🎉`;
    }
    
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply })
    });
    const tgData = await tgRes.json();
    console.log('TG RES:', JSON.stringify(tgData));
    
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('ERROR:', err);
    return res.status(200).send('ok');
  }
}
