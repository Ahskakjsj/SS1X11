import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import { spawn } from "child_process";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));

// Global State
let botProcess: any = null;
let botStatus: 'online' | 'offline' | 'starting' | 'error' = 'offline';
let botLogs: string[] = [];
let currentToken = "";
let activeEntrypoint = "bot.js";

const DEFAULT_BOT_CODE = `import { Client, GatewayIntentBits } from 'discord.js';
import { GoogleGenAI } from '@google/genai';

// تهيئة بوت ديسكورد مع الصلاحيات المطلوبة
// تنبيه: يجب تفعيل 'Message Content Intent' في صفحة المطورين بديسكورد لقراءة محتوى الرسائل!
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// تهيئة الذكاء الاصطناعي من جوجل (تلقائي باستعمال المفتاح المتاح في الخادم)
const aiKey = process.env.GEMINI_API_KEY;
let ai = null;
if (aiKey) {
  ai = new GoogleGenAI({ apiKey: aiKey });
  console.log("🤖 تم تفعيل ميزة الذكاء الاصطناعي Gemini للبوت!");
} else {
  console.log("⚠️ تنبيه: لم يتم العثور على مفتاح GEMINI_API_KEY في الخادم.");
}

client.on('ready', () => {
  console.log(\`🟢 تم تشغيل البوت بنجاح! مسجل كـ: \${client.user?.tag}\`);
  console.log("✨ البوت جاهز لاستقبال الأوامر في السيرفرات.");
});

client.on('messageCreate', async (message) => {
  // تجاهل رسائل البوتات لتفادي التكرار اللا نهائي
  if (message.author.bot) return;

  const content = message.content.trim();

  // أمر فحص الاتصال
  if (content === '!ping') {
    return message.reply('pong! 🏓');
  }

  // أمر المساعدة
  if (content === '!help') {
    const helpMessage = \`
**🤖 أهلاً بك في البوت المستضاف!**
الأوامر المتاحة:
• \`\\!ping\` - للتحقق من سرعة الاتصال.
• \`\\!ai [سؤالك]\` - للتحدث مع ذكاء Gemini الاصطناعي.
• \`\\!help\` - لعرض هذه القائمة.
\`;
    return message.reply(helpMessage);
  }

  // أمر الذكاء الاصطناعي
  if (content.startsWith('!ai ')) {
    const prompt = content.slice(4).trim();
    if (!prompt) {
      return message.reply('الرجاء كتابة سؤال بعد الأمر. مثال: \`!ai ما هي عاصمة السعودية؟\`');
    }

    if (!ai) {
      return message.reply('عذراً، ميزة الذكاء الاصطناعي غير مفعلة حالياً في الخادم لعدم توفر مفتاح API.');
    }

    try {
      // محاكاة جاري الكتابة لتجربة مستخدم أفضل
      await message.channel.sendTyping();

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const replyText = response.text || "لم أستطع معالجة السؤال.";
      
      if (replyText.length > 2000) {
        return message.reply(replyText.slice(0, 1990) + '...');
      }

      return message.reply(replyText);
    } catch (err) {
      console.error("خطأ الذكاء الاصطناعي:", err);
      return message.reply(\`حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: \${err.message}\`);
    }
  }
});

// تسجيل الدخول بالرمز الممرر من لوحة التحكم تلقائياً
client.login(process.env.DISCORD_TOKEN);
`;

let currentCode = DEFAULT_BOT_CODE;

const CONFIG_PATH = './bot_workspace/config.json';

function addLog(text: string) {
  const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  botLogs.push(`[${time}] ${text}`);
  if (botLogs.length > 500) {
    botLogs.shift();
  }
}

// Initial setup: Load saved bot code/token if available
async function initBotWorkspace() {
  try {
    await fs.mkdir('./bot_workspace', { recursive: true });
    // Ensure package.json exists inside bot_workspace with commonjs type
    // This allows both require (CommonJS) and import (handled by tsx transpiler) to run flawlessly.
    await fs.writeFile('./bot_workspace/package.json', JSON.stringify({ type: "commonjs" }, null, 2), 'utf-8');
    
    let config: any = {};
    try {
      const data = await fs.readFile(CONFIG_PATH, 'utf-8');
      config = JSON.parse(data);
    } catch (err) {}

    currentCode = config.code || DEFAULT_BOT_CODE;
    currentToken = process.env.DISCORD_TOKEN || config.token || "";
    activeEntrypoint = config.activeEntrypoint || "bot.js";

    // If config.json doesn't match the DISCORD_TOKEN env, save it to sync
    if (process.env.DISCORD_TOKEN && config.token !== process.env.DISCORD_TOKEN) {
      config.token = process.env.DISCORD_TOKEN;
      await fs.writeFile(CONFIG_PATH, JSON.stringify({ token: currentToken, code: currentCode, activeEntrypoint }, null, 2), 'utf-8');
    }

    addLog("⚙️ تم استرداد كود وإعدادات البوت السابقة بنجاح.");

    // Auto-start bot on server boot if we have a token!
    if (currentToken) {
      addLog("🚀 تم اكتشاف رمز بوت محفوظ، جاري تشغيل البوت تلقائياً عند بدء التشغيل...");
      // Delay slightly to ensure server is ready
      setTimeout(() => {
        startBotProcess();
      }, 1000);
    }
  } catch (e) {
    currentCode = DEFAULT_BOT_CODE;
    currentToken = process.env.DISCORD_TOKEN || "";
    activeEntrypoint = "bot.js";
    addLog("ℹ️ لا توجد تهيئة سابقة. تم تحميل القالب الافتراضي الجاهز للبوت.");
    try {
      await fs.writeFile('./bot_workspace/package.json', JSON.stringify({ type: "commonjs" }, null, 2), 'utf-8');
      await fs.writeFile('./bot_workspace/bot.js', DEFAULT_BOT_CODE, 'utf-8');
      await fs.writeFile(CONFIG_PATH, JSON.stringify({ token: currentToken, code: currentCode, activeEntrypoint }, null, 2), 'utf-8');
    } catch (err) {}

    if (currentToken) {
      addLog("🚀 تم اكتشاف رمز بوت من متغيرات البيئة، جاري تشغيل البوت تلقائياً...");
      setTimeout(() => {
        startBotProcess();
      }, 1000);
    }
  }
}

// Save current code & token to disk
async function saveBotWorkspace(token: string, code: string) {
  try {
    await fs.mkdir('./bot_workspace', { recursive: true });
    await fs.writeFile(`./bot_workspace/${activeEntrypoint}`, code, 'utf-8');
    await fs.writeFile(CONFIG_PATH, JSON.stringify({ token, code, activeEntrypoint }, null, 2), 'utf-8');
    currentCode = code;
    currentToken = token;
  } catch (error: any) {
    addLog(`❌ خطأ أثناء حفظ الملفات: ${error.message}`);
  }
}

// Start Bot function
async function startBotProcess() {
  if (botProcess) {
    addLog("🔄 جاري إيقاف البوت النشط حالياً لإعادة تشغيله...");
    botProcess.kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 1200));
    botProcess = null;
  }

  if (!currentToken) {
    botStatus = 'error';
    addLog("❌ خطأ: رمز البوت (Discord Token) غير مدخل. يرجى إدخاله لتشغيل البوت.");
    return;
  }

  botStatus = 'starting';
  addLog("🔌 جاري تحضير الملفات وبدء عملية البوت...");

  try {
    await saveBotWorkspace(currentToken, currentCode);

    botProcess = spawn('npx', ['tsx', `./bot_workspace/${activeEntrypoint}`], {
      env: {
        ...process.env,
        DISCORD_TOKEN: currentToken,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
      }
    });

    botStatus = 'online';
    addLog("🚀 تم بدء عملية تشغيل البوت بنجاح.");

    botProcess.stdout.on('data', (data: Buffer) => {
      const output = data.toString('utf-8').trim();
      if (output) {
        // Look for common error logs inside stdout just in case
        if (output.toLowerCase().includes('error') || output.includes('thrown')) {
          botStatus = 'error';
        }
        addLog(`[CON] ${output}`);
      }
    });

    botProcess.stderr.on('data', (data: Buffer) => {
      const output = data.toString('utf-8').trim();
      if (output) {
        botStatus = 'error';
        addLog(`[ERR] ${output}`);
      }
    });

    botProcess.on('close', (code: number) => {
      addLog(`💤 توقفت عملية البوت تلقائياً (كود الخروج: ${code})`);
      botStatus = 'offline';
      botProcess = null;
    });

    botProcess.on('error', (err: Error) => {
      botStatus = 'error';
      addLog(`❌ فشل في تشغيل خادم البوت: ${err.message}`);
      botProcess = null;
    });

  } catch (err: any) {
    botStatus = 'error';
    addLog(`❌ حدث خطأ أثناء تشغيل عملية البوت: ${err.message}`);
    botProcess = null;
  }
}

// Stop Bot function
async function stopBotProcess() {
  if (botProcess) {
    botProcess.kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 1000));
    botProcess = null;
    botStatus = 'offline';
    addLog("🛑 تم إيقاف البوت بنجاح بواسطة المستخدم.");
  } else {
    addLog("⚠️ البوت متوقف بالفعل.");
  }
}

// API Routes
app.get("/api/bot/status", (req, res) => {
  // Mask token for security in the client, but return the full token if they need to edit it
  const maskedToken = currentToken 
    ? `${currentToken.substring(0, 8)}...${currentToken.substring(currentToken.length - 8)}` 
    : "";
    
  res.json({
    status: botStatus,
    code: currentCode,
    token: currentToken, // return raw token for inputs, but frontend will mask it in visual display
    maskedToken,
    logs: botLogs,
    activeEntrypoint,
  });
});

// File Management APIs
app.get("/api/files", async (req, res) => {
  try {
    const dirPath = './bot_workspace';
    await fs.mkdir(dirPath, { recursive: true });
    const files = await fs.readdir(dirPath);
    
    const fileList = [];
    for (const file of files) {
      if (file === 'config.json' || file === 'package.json') continue; // Hide metadata
      const filePath = path.join(dirPath, file);
      try {
        const stat = await fs.stat(filePath);
        if (stat.isFile()) {
          fileList.push({
            name: file,
            size: stat.size,
            isEntrypoint: file === activeEntrypoint,
          });
        }
      } catch (statErr) {}
    }
    res.json({ success: true, files: fileList, activeEntrypoint });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/files/content", async (req, res) => {
  const { name } = req.query;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ success: false, error: "اسم الملف مطلوب" });
  }
  try {
    const filePath = path.join('./bot_workspace', path.basename(name));
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ success: true, content });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/files/save", async (req, res) => {
  const { name, content } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ success: false, error: "اسم الملف مطلوب" });
  }
  if (name === 'package.json' || name === 'config.json') {
    return res.status(403).json({ success: false, error: "غير مسموح بتعديل ملفات النظام" });
  }
  try {
    const safeName = path.basename(name);
    const filePath = path.join('./bot_workspace', safeName);
    await fs.writeFile(filePath, content || "", 'utf-8');
    
    // If it's the active entrypoint file, we also update currentCode in memory
    if (safeName === activeEntrypoint) {
      currentCode = content || "";
    }
    
    // Update config.json
    await fs.writeFile(CONFIG_PATH, JSON.stringify({ token: currentToken, code: currentCode, activeEntrypoint }, null, 2), 'utf-8');
    
    addLog(`💾 تم حفظ تعديلات ملف "${safeName}" بنجاح.`);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/files/create", async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ success: false, error: "اسم الملف مطلوب" });
  }
  try {
    const safeName = path.basename(name);
    const filePath = path.join('./bot_workspace', safeName);
    
    // Check if file already exists
    try {
      await fs.access(filePath);
      return res.status(400).json({ success: false, error: "الملف موجود بالفعل" });
    } catch {
      // File doesn't exist, proceed
    }

    const initialContent = `// ملف جديد: ${safeName}\n// اكتب كود البوت أو الوحدات البرمجية هنا...\n`;
    await fs.writeFile(filePath, initialContent, 'utf-8');
    addLog(`📁 تم إنشاء ملف جديد باسم "${safeName}".`);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/files/delete", async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ success: false, error: "اسم الملف مطلوب" });
  }
  if (name === 'bot.js' || name === 'package.json' || name === 'config.json') {
    return res.status(400).json({ success: false, error: "لا يمكن حذف ملفات الإعداد والتشغيل المحمية" });
  }
  try {
    const safeName = path.basename(name);
    const filePath = path.join('./bot_workspace', safeName);
    await fs.unlink(filePath);
    addLog(`🗑️ تم حذف ملف "${safeName}".`);
    
    // If deleted file was the active entrypoint, reset active entrypoint to bot.js
    if (safeName === activeEntrypoint) {
      activeEntrypoint = "bot.js";
      await fs.writeFile(CONFIG_PATH, JSON.stringify({ token: currentToken, code: currentCode, activeEntrypoint: "bot.js" }, null, 2), 'utf-8');
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/files/set-entrypoint", async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ success: false, error: "اسم الملف مطلوب" });
  }
  try {
    const safeName = path.basename(name);
    activeEntrypoint = safeName;
    
    // Read the file's content to update currentCode
    const filePath = path.join('./bot_workspace', safeName);
    const content = await fs.readFile(filePath, 'utf-8');
    currentCode = content;

    // Update config.json
    await fs.writeFile(CONFIG_PATH, JSON.stringify({ token: currentToken, code: currentCode, activeEntrypoint }, null, 2), 'utf-8');
    
    addLog(`🎯 تم تعيين ملف "${safeName}" كملف التشغيل الرئيسي للبوت.`);
    res.json({ success: true, activeEntrypoint });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/bot/save", async (req, res) => {
  const { code, token } = req.body;
  if (code !== undefined) currentCode = code;
  if (token !== undefined) currentToken = token;
  
  await saveBotWorkspace(currentToken, currentCode);
  addLog("💾 تم حفظ تعديلات كود البوت والإعدادات بنجاح.");
  res.json({ success: true, message: "تم الحفظ بنجاح" });
});

app.post("/api/bot/start", async (req, res) => {
  const { token, code } = req.body;
  if (token !== undefined) currentToken = token;
  if (code !== undefined) currentCode = code;

  // Run async but respond immediately so client doesn't hang
  startBotProcess();
  res.json({ success: true, message: "بدأت عملية التشغيل" });
});

app.post("/api/bot/stop", async (req, res) => {
  await stopBotProcess();
  res.json({ success: true, message: "تم إيقاف البوت" });
});

app.post("/api/bot/clear-logs", (req, res) => {
  botLogs = [];
  addLog("🧹 تم مسح سجل الكونسول.");
  res.json({ success: true });
});

// Setup workspace on startup
initBotWorkspace();

// Setup Vite Dev Middleware or Serve Production Build
async function startApp() {
  let isProduction = process.env.NODE_ENV === "production";
  
  // If not explicitly production, check if the compiled 'dist' directory exists.
  // This makes the app extremely resilient when deployed to Render/Heroku without manual env configuration!
  if (!isProduction) {
    try {
      await fs.access(path.join(process.cwd(), 'dist', 'index.html'));
      isProduction = true;
      console.log("📦 Detected production build directory. Running in Production mode automatically!");
    } catch {
      isProduction = false;
    }
  }

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Host server is running on http://localhost:${PORT}`);
  });
}

startApp().catch(err => {
  console.error("Failed to start server:", err);
});
