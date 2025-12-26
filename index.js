import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const DISCORD_WEBHOOK =
  "https://discord.com/api/webhooks/1453761020895170592/rEkqBJ_c8yHZj3dcR_02GJXZwrlHWkgLyccy1JFXZTLi2PZoqCJRto9TcI5C29nQ2h_j"; // ganti webhook kamu

app.post("/send", upload.single("image"), async (req, res) => {
  try {
    const { user, mechanic, desc, denda, total, items } = req.body;

    const embed = {
      title: "🚗 Elite Custom Garage",
      color: 5793266,
      fields: [
        { name: "👤 Customer", value: user || "-", inline: true },
        { name: "🔧 Mekanik", value: mechanic || "-", inline: true },
        { name: "📦 Deskripsi", value: "```" + (desc || "-") + "```" },
        {
          name: "🧾 Item",
          value: items ? "```" + JSON.parse(items).join("\n") + "```" : "-"
        },
        { name: "⚠️ Denda", value: "$ " + (denda || 0), inline: true },
        { name: "💰 Total", value: "$ " + (total || 0), inline: true }
      ],
      timestamp: new Date().toISOString()
    };

    const form = new FormData();
    form.append(
      "payload_json",
      JSON.stringify({ username: "Elite Custom Garage", embeds: [embed] })
    );

    if (req.file) {
      embed.image = { url: "attachment://order.png" };
      form.append("file", req.file.buffer, "order.png");
    }

    const r = await fetch(DISCORD_WEBHOOK, { method: "POST", body: form });
    if (!r.ok) throw new Error("Discord error");

    res.json({ status: "ok" });
  } catch (e) {
    res.status(500).json({ status: "error", error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Proxy running"));
