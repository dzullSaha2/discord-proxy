import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import path from "path";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1453761020895170592/rEkqBJ_c8yHZj3dcR_02GJXZwrlHWkgLyccy1JFXZTLi2PZoqCJRto9TcI5C29nQ2h_j"; // ganti webhook kamu

// ===== Serve static frontend =====
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ===== Proxy endpoint =====
app.post("/send", upload.single("image"), async (req, res) => {
  try {
    const { user, mechanic, desc, denda, total, items } = req.body;

    const embed = {
      title: "🚗 Elite Custom Garage",
      description: desc ? "```" + desc + "```" : "-",
      color: 0x2ecc71,
      fields: [
        { name: "👤 Customer", value: user || "-", inline: true },
        { name: "🔧 Mekanik", value: mechanic || "-", inline: true },
        {
          name: "🧾 Item",
          value: items ? "```" + JSON.parse(items).join("\n") + "```" : "-",
          inline: false
        },
        { name: "⚠️ Denda", value: "$ " + (denda || 0), inline: true },
        { name: "💰 Total Akhir", value: "$ " + (total || 0), inline: true }
      ],
      footer: { text: "Order Confirmation • Elite Custom Garage" },
      timestamp: new Date().toISOString()
    };

    const form = new FormData();
    form.append("payload_json", JSON.stringify({ username: "Elite Custom Garage", embeds: [embed] }));

    if (req.file) {
      embed.image = { url: "attachment://order.png" };
      form.append("file", req.file.buffer, { filename: "order.png", contentType: req.file.mimetype });
    }

    const r = await fetch(DISCORD_WEBHOOK, { method: "POST", body: form });
    if (!r.ok) throw new Error(`Discord error ${r.status}`);

    res.json({ status: "ok" });
  } catch (e) {
    console.error("SEND ERROR:", e);
    res.status(500).json({ status: "error", error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy running on port", PORT));
