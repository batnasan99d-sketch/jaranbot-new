module.exports = async (req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (req.method !== 'POST') {
    return res.status(200).send('Jaran Bot is running! Fix applied!');
  }
  try {
    const body = req.body || {};
    const msg = body.message;
    if (!msg || !msg.text) return res.status(200).send('ok');
    const chatId = msg.chat.id;
    const text = msg.text;
    let reply = text.startsWith('/start') 
      ? '🤖 Сайн уу! Jaran Bot FINALLY ажиллаж байна! 🎉 ID: ' + chatId 
      : 'Та "' + text + '" гэж бичлээ.';
    await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: chatId, text: reply})
    });
    return res.status(200).send('ok');
  } catch(e) {
    return res.status(200).send('ok');
  }
};
