import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ================== CONFIG ==================
const DISCORD_WEBHOOK =
  "https://discord.com/api/webhooks/1453761020895170592/rEkqBJ_c8yHZj3dcR_02GJXZwrlHWkgLyccy1JFXZTLi2PZoqCJRto9TcI5C29nQ2h_j"; // GANTI WEBHOOK

// ================== POST /send ==================
app.post("/send", upload.single("image"), async (req, res) => {
  try {
    const { user = "-", mechanic = "-", desc = "-", denda = "0", total = "0", items = "[]" } = req.body;
    let itemsArr = [];
    try { itemsArr = JSON.parse(items); } catch(e){}

    // ================== FORMAT EMBED ==================
    const embed = {
      title: "🚗 Elite Custom Garage",
      color: 5793266,
      fields: [
        { name: "👤 Customer", value: user, inline: true },
        { name: "🔧 Mekanik", value: mechanic, inline: true },
        { name: "📦 Deskripsi", value: "```" + desc + "```" },
        { name: "🧾 Item", value: itemsArr.length ? "```" + itemsArr.join("\n") + "```" : "-", inline: false },
        { name: "⚠️ Denda", value: "$ " + denda, inline: true },
        { name: "💰 Total Akhir", value: "$ " + total, inline: true }
      ],
      footer: { text: "Order Confirmation • Elite Custom Garage" },
      timestamp: new Date().toISOString()
    };

    // ================== FORM DATA ==================
    const form = new FormData();
    form.append("payload_json", JSON.stringify({ username: "Elite Custom Garage", embeds: [embed] }));

    if (req.file) {
      embed.image = { url: "attachment://order.png" };
      form.append("file", req.file.buffer, { filename: "order.png", contentType: req.file.mimetype });
    }

    // ================== SEND TO DISCORD ==================
    const discordRes = await fetch(DISCORD_WEBHOOK, { method: "POST", body: form });
    if (!discordRes.ok) throw new Error(`Discord error ${discordRes.status}`);

    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
