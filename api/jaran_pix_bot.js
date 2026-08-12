export default async function handler(req, res) {
  const TOKEN = "8961431875:AAEuh7IFjJz5mCqIar5tMXTBFA1zhxImWuc";
  const msg = req.body?.message;
  if (!msg) return res.status(200).send("ok");
  
  const chatId = msg.chat.id;
  const text = msg.text || "";
  let reply = text === "/start" 
    ? "Сайн уу! 📸 Жаран архивт тавтай морил!\n\nӨдрөө бич: 2026-08-20 14:00" 
    : "🔔 Захиалга: " + text + "\nТун удахгүй холбогдоно!";

  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({chat_id: chatId, text: reply})
  });
  res.status(200).send("ok");
}
