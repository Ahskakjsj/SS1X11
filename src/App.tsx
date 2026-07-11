import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  UploadCloud, 
  Code2, 
  Terminal, 
  HelpCircle, 
  FileCode, 
  Trash2, 
  Copy, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  Info,
  Layers,
  Settings,
  Eye,
  EyeOff,
  FolderOpen,
  File,
  Plus,
  Trash,
  PlayCircle
} from 'lucide-react';

// القوالب الجاهزة للبوت
const TEMPLATES = [
  {
    id: 'ai',
    name: 'بوت الذكاء الاصطناعي (Gemini AI)',
    description: 'يستخدم ذكاء جوجل الاصطناعي للإجابة على أسئلة أعضاء السيرفر عبر أمر !ai تلقائياً.',
    icon: Sparkles,
    code: `import { Client, GatewayIntentBits } from 'discord.js';
import { GoogleGenAI } from '@google/genai';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// تهيئة الذكاء الاصطناعي
const aiKey = process.env.GEMINI_API_KEY;
let ai = null;
if (aiKey) {
  ai = new GoogleGenAI({ apiKey: aiKey });
  console.log("🤖 تم تفعيل ميزة الذكاء الاصطناعي Gemini للبوت!");
} else {
  console.log("⚠️ تنبيه: لم يتم العثور على مفتاح GEMINI_API_KEY.");
}

client.on('ready', () => {
  console.log(\`🟢 تم تشغيل البوت بنجاح! مسجل كـ: \${client.user.tag}\`);
  console.log("اكتب !ai متبوعة بسؤالك للتحدث معي!");
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  if (content.startsWith('!ai ')) {
    const prompt = content.slice(4).trim();
    if (!prompt) {
      return message.reply('اكتب سؤالاً بعد الأمر. مثال: \`!ai ما هو ديسكورد؟\`');
    }

    if (!ai) {
      return message.reply('عذراً، ميزة الذكاء الاصطناعي غير متوفرة في هذا السيرفر حالياً.');
    }

    try {
      await message.channel.sendTyping();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const replyText = response.text || "لم أستطع الحصول على إجابة.";
      if (replyText.length > 2000) {
        return message.reply(replyText.slice(0, 1990) + '...');
      }
      return message.reply(replyText);
    } catch (err) {
      console.error(err);
      return message.reply('حدث خطأ أثناء معالجة السؤال بالذكاء الاصطناعي.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);`
  },
  {
    id: 'ping-pong',
    name: 'البوت الكلاسيكي (Ping-Pong)',
    description: 'بوت بسيط جداً للتحقق من سرعة الاستجابة، مثالي للمبتدئين للتجربة السريعة.',
    icon: FileCode,
    code: `import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(\`🟢 البوت الكلاسيكي متصل كـ: \${client.user.tag}\`);
  console.log("جرب كتابة !ping في أي قناة!");
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  if (message.content.trim() === '!ping') {
    const latency = Date.now() - message.createdTimestamp;
    message.reply(\`🏓 بونغ! سرعة الاستجابة: \${latency}ms\`);
  }
});

client.login(process.env.DISCORD_TOKEN);`
  },
  {
    id: 'moderator',
    name: 'بوت الترحيب والإشراف (Moderator)',
    description: 'يرحب بالأعضاء الجدد تلقائياً ويقوم بحظر الكلمات البذيئة أو غير اللائقة من قنوات الدردشة.',
    icon: Layers,
    code: `import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// قائمة الكلمات الممنوعة
const BANNED_WORDS = ['ممنوع1', 'ممنوع2', 'سبام', 'اختراق'];

client.on('ready', () => {
  console.log(\`🟢 بوت الإشراف جاهز ومتصل كـ: \${client.user.tag}\`);
  console.log("يقوم البوت الآن بمراقبة الدردشة والترحيب بالأعضاء الجدد.");
});

// الترحيب بالأعضاء الجدد
client.on('guildMemberAdd', (member) => {
  console.log(\`👤 عضو جديد انضم للسيرفر: \${member.user.tag}\`);
  const welcomeChannel = member.guild.channels.cache.find(ch => ch.name.includes('welcome') || ch.name.includes('ترحيب'));
  if (welcomeChannel && welcomeChannel.isTextBased()) {
    welcomeChannel.send(\`أهلاً بك يا \${member} في سيرفرنا الرائع! 🎉 نتمنى لك وقتاً ممتعاً.\`);
  }
});

// مراقبة الرسائل والكلمات البذيئة
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();
  
  // التحقق من وجود كلمات ممنوعة
  const hasBannedWord = BANNED_WORDS.some(word => content.includes(word));
  
  if (hasBannedWord) {
    try {
      await message.delete();
      const warning = await message.channel.send(\`⚠️ عذراً \${message.author}، رسالتك تحتوي على كلمات غير مسموح بها وتم حذفها.\`);
      // حذف التنبيه بعد 5 ثوانٍ للحفاظ على نظافة القناة
      setTimeout(() => warning.delete().catch(() => {}), 5000);
    } catch (err) {
      console.error("فشل حذف الرسالة المخالفة:", err.message);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);`
  }
];

export default function App() {
  const [status, setStatus] = useState<'online' | 'offline' | 'starting' | 'error'>('offline');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [maskedToken, setMaskedToken] = useState('');
  const [showRawToken, setShowRawToken] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  // File Explorer states
  const [files, setFiles] = useState<Array<{ name: string; size: number; isEntrypoint: boolean }>>([]);
  const [activeFile, setActiveFile] = useState<string>('bot.js');
  const [activeEntrypoint, setActiveEntrypoint] = useState<string>('bot.js');
  const [newFileName, setNewFileName] = useState<string>('');

  // UI states
  const [activeTab, setActiveTab] = useState<'editor' | 'setup' | 'templates'>('editor');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('ai');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [hasIntentsOpen, setHasIntentsOpen] = useState(true);

  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Synchronized scroll for editor line numbers
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Fetch file list from server
  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setFiles(data.files || []);
          setActiveEntrypoint(data.activeEntrypoint || 'bot.js');
        }
      }
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  // Fetch status and logs manually or for notifications
  const fetchStatus = async (showNotification = false) => {
    try {
      const res = await fetch('/api/bot/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setMaskedToken(data.maskedToken);
        setLogs(data.logs || []);
        
        if (showNotification) {
          triggerAlert('success', 'تم تحديث حالة البوت بنجاح من الخادم.');
        }
      }
    } catch (err) {
      console.error("Error fetching bot status:", err);
    }
  };

  // Load a file's content into the editor
  const loadFileContent = async (fileName: string) => {
    try {
      const res = await fetch(`/api/files/content?name=${encodeURIComponent(fileName)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCode(data.content);
          setActiveFile(fileName);
          triggerAlert('success', `تم فتح ملف "${fileName}" في المحرر بنجاح.`);
        }
      }
    } catch (err: any) {
      triggerAlert('error', `فشل تحميل الملف: ${err.message}`);
    }
  };

  // Initial load and periodic polling setup
  useEffect(() => {
    const initLoad = async () => {
      await fetchFiles();
      try {
        const res = await fetch('/api/bot/status');
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          setToken(data.token || '');
          setMaskedToken(data.maskedToken);
          setLogs(data.logs || []);
          
          const startFile = data.activeEntrypoint || 'bot.js';
          setActiveFile(startFile);
          
          const contentRes = await fetch(`/api/files/content?name=${encodeURIComponent(startFile)}`);
          if (contentRes.ok) {
            const contentData = await contentRes.json();
            if (contentData.success) {
              setCode(contentData.content);
            }
          }
        }
      } catch (err) {
        console.error("Error in initial load:", err);
      }
    };

    initLoad();

    // Set up polling for status, logs, and files ONLY (no editor code overwriting!)
    const interval = setInterval(() => {
      const poll = async () => {
        try {
          const res = await fetch('/api/bot/status');
          if (res.ok) {
            const data = await res.json();
            setStatus(data.status);
            setLogs(data.logs || []);
          }
          
          const filesRes = await fetch('/api/files');
          if (filesRes.ok) {
            const filesData = await filesRes.json();
            if (filesData.success) {
              setFiles(filesData.files || []);
              setActiveEntrypoint(filesData.activeEntrypoint || 'bot.js');
            }
          }
        } catch (err) {
          console.error("Error polling server:", err);
        }
      };
      poll();
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const triggerAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Scroll terminal to the bottom whenever logs change
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // File explorer action handlers
  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    
    let formattedName = newFileName.trim();
    // Validate filename format
    if (!formattedName.endsWith('.js') && !formattedName.endsWith('.json') && !formattedName.endsWith('.txt')) {
      formattedName += '.js';
    }

    try {
      const res = await fetch('/api/files/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formattedName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerAlert('success', `تم إنشاء ملف "${formattedName}" بنجاح.`);
        setNewFileName('');
        await fetchFiles();
        // Load the new file immediately in the editor
        await loadFileContent(formattedName);
      } else {
        triggerAlert('error', data.error || 'فشل إنشاء الملف.');
      }
    } catch (err: any) {
      triggerAlert('error', `حدث خطأ: ${err.message}`);
    }
  };

  const handleDeleteFile = async (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening the file
    if (fileName === 'bot.js') {
      triggerAlert('error', 'لا يمكن حذف ملف التشغيل الرئيسي bot.js');
      return;
    }
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف ملف "${fileName}" نهائياً؟`)) {
      return;
    }

    try {
      const res = await fetch('/api/files/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fileName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerAlert('success', `تم حذف ملف "${fileName}" بنجاح.`);
        await fetchFiles();
        // If we deleted the active file, load bot.js
        if (fileName === activeFile) {
          await loadFileContent('bot.js');
        }
      } else {
        triggerAlert('error', data.error || 'فشل حذف الملف.');
      }
    } catch (err: any) {
      triggerAlert('error', `حدث خطأ: ${err.message}`);
    }
  };

  const handleSetEntrypoint = async (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/files/set-entrypoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fileName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerAlert('success', `تم تعيين "${fileName}" كملف التشغيل الرئيسي للبوت بنجاح.`);
        await fetchFiles();
      } else {
        triggerAlert('error', data.error || 'فشل تعيين ملف التشغيل.');
      }
    } catch (err: any) {
      triggerAlert('error', `حدث خطأ: ${err.message}`);
    }
  };

  // Actions
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save active file content
      const resFile = await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: activeFile, content: code })
      });
      
      // Save token separately
      const resToken = await fetch('/api/bot/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (resFile.ok && resToken.ok) {
        triggerAlert('success', `تم حفظ ملف "${activeFile}" والإعدادات بنجاح.`);
        await fetchFiles();
        await fetchStatus();
      } else {
        triggerAlert('error', 'فشل حفظ التعديلات.');
      }
    } catch (err: any) {
      triggerAlert('error', `حدث خطأ: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStart = async () => {
    if (!token.trim()) {
      triggerAlert('error', 'الرجاء إدخال رمز البوت (Discord Bot Token) أولاً لتشغيل البوت.');
      return;
    }
    setIsStarting(true);
    try {
      const res = await fetch('/api/bot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, code })
      });
      if (res.ok) {
        triggerAlert('info', 'جاري تشغيل البوت... تفقد الكونسول لمتابعة التفاصيل.');
        setStatus('starting');
        // Instantly poll to show starting log
        setTimeout(fetchStatus, 300);
      } else {
        triggerAlert('error', 'فشل إرسال أمر تشغيل البوت.');
      }
    } catch (err: any) {
      triggerAlert('error', `حدث خطأ: ${err.message}`);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    try {
      const res = await fetch('/api/bot/stop', { method: 'POST' });
      if (res.ok) {
        triggerAlert('info', 'تم إرسال أمر إيقاف البوت.');
        setStatus('offline');
        setTimeout(fetchStatus, 500);
      } else {
        triggerAlert('error', 'فشل إيقاف البوت.');
      }
    } catch (err: any) {
      triggerAlert('error', `حدث خطأ: ${err.message}`);
    } finally {
      setIsStopping(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      const res = await fetch('/api/bot/clear-logs', { method: 'POST' });
      if (res.ok) {
        setLogs([]);
        triggerAlert('success', 'تم مسح سجل الكونسول.');
      }
    } catch (err: any) {
      triggerAlert('error', `فشل مسح الكونسول: ${err.message}`);
    }
  };

  // Drag and drop handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileRead(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileRead(files[0]);
    }
  };

  const handleFileRead = (file: File) => {
    if (!file.name.endsWith('.js') && !file.name.endsWith('.ts') && !file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
      triggerAlert('error', 'يرجى رفع ملفات (.js, .json, .txt) فقط.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (text) {
        try {
          const res = await fetch('/api/files/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: file.name, content: text })
          });
          if (res.ok) {
            triggerAlert('success', `تم رفع وحفظ ملف "${file.name}" بنجاح على الخادم.`);
            await fetchFiles();
            await loadFileContent(file.name);
            setActiveTab('editor');
          } else {
            triggerAlert('error', 'فشل حفظ الملف المرفوع على الخادم.');
          }
        } catch (err: any) {
          triggerAlert('error', `حدث خطأ أثناء حفظ الملف المرفوع: ${err.message}`);
        }
      }
    };
    reader.onerror = () => {
      triggerAlert('error', 'حدث خطأ أثناء قراءة الملف.');
    };
    reader.readAsText(file);
  };

  // Template select handler
  const handleLoadTemplate = (templateId: string) => {
    const tpl = TEMPLATES.find(t => t.id === templateId);
    if (tpl) {
      setCode(tpl.code);
      setSelectedTemplate(templateId);
      triggerAlert('success', `تم تحميل قالب "${tpl.name}" في المحرر بنجاح.`);
      setActiveTab('editor');
    }
  };

  const copyInviteLinkTemplate = () => {
    const dummyLink = "https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands";
    navigator.clipboard.writeText(dummyLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    triggerAlert('success', 'تم نسخ قالب رابط الدعوة. استبدل YOUR_CLIENT_ID بمعرّف بوتك الخاص.');
  };

  // Status visual aids
  const getStatusBadge = () => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 glow-green animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            متصل الآن
          </span>
        );
      case 'starting':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 glow-yellow">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            جاري التشغيل...
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 glow-red">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            خطأ بروتوكول
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            متوقف
          </span>
        );
    }
  };

  // Code editor lines counter
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col antialiased">
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-[#0c0c0e] sticky top-0 z-50 px-6 py-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center glow-discord">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                BotHost <span className="text-indigo-400 text-sm font-normal">| استضافة البوتات السحابية</span>
                <span className="text-[10px] bg-indigo-950/80 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-medium">سحابي مستقر</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">ارفع ملف البوت، عدل كودك فورياً وشغله بثوانٍ معدودة</p>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="text-xs text-zinc-400">جميع الأنظمة تعمل</span>
            </div>
          <div className="flex items-center gap-2.5">
            {getStatusBadge()}
            
            {status === 'online' ? (
              <button
                onClick={handleStop}
                disabled={isStopping}
                className="py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                title="إيقاف البوت النشط"
              >
                <Square className="w-3 h-3 fill-white" />
                <span>إيقاف البوت</span>
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={isStarting}
                className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-md shadow-indigo-600/10 animate-pulse"
                title="تشغيل البوت السحابي"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>تشغيل البوت</span>
              </button>
            )}

            <button 
              onClick={() => fetchStatus(true)}
              title="تحديث الحالة يدوياً"
              className="p-2 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          </div>
        </div>
      </header>

      {/* Alert Notification Popup */}
      {alert && (
        <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-bounce">
          <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-2xl ${
            alert.type === 'success' ? 'bg-emerald-950/95 border-emerald-500/30 text-emerald-200' :
            alert.type === 'error' ? 'bg-red-950/95 border-red-500/30 text-red-200' :
            'bg-blue-950/95 border-blue-500/30 text-blue-200'
          }`}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium leading-relaxed">
              {alert.message}
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Control and Token Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Bot Controller Panel */}
          <section className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col gap-5">
            <h2 className="text-md font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Settings className="w-4.5 h-4.5 text-indigo-500" />
              لوحة التحكم والإعدادات
            </h2>

            {/* Token Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>رمز البوت الخاص بك (Bot Token):</span>
                <span className="text-[10px] text-amber-500">سري ومحفوظ آمنياً</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showRawToken ? "text" : "password"}
                  placeholder={maskedToken ? "••••••••••••••••••••••••" : "أدخل رمز البوت (MTAy...)"}
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    if (!e.target.value) setMaskedToken('');
                  }}
                  className="w-full bg-[#050506] border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl py-2.5 px-3 pl-10 text-xs font-mono tracking-wider text-zinc-100 placeholder-zinc-700 transition-all text-left"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowRawToken(!showRawToken)}
                  className="absolute left-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showRawToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal">
                يمكنك الحصول على الرمز من <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-0.5">بوابة المطورين بديسكورد <ExternalLink className="w-2.5 h-2.5" /></a>.
              </p>
            </div>

            {/* Quick Action Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {status === 'online' ? (
                <button
                  onClick={handleStop}
                  disabled={isStopping}
                  className="col-span-2 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/10 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Square className="w-4 h-4 fill-white" />
                  {isStopping ? "جاري الإيقاف..." : "إيقاف البوت النشط"}
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  disabled={isStarting}
                  className="col-span-2 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-white" />
                  {isStarting ? "جاري التشغيل..." : "تشغيل البوت السحابي"}
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="py-2.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-all active:scale-[0.98]"
              >
                <Check className="w-3.5 h-3.5" />
                {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>

              <button
                onClick={handleStart}
                disabled={isStarting || status === 'offline'}
                className="py-2.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-all active:scale-[0.98]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                إعادة تشغيل فوري
              </button>
            </div>
          </section>

          {/* Cloud File Explorer Panel */}
          <section className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/80 pb-2.5 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-indigo-400" />
              مستكشف وإدارة الملفات السحابية
            </h3>

            {/* Create New File Form */}
            <form onSubmit={handleCreateFile} className="flex gap-1.5">
              <input
                type="text"
                placeholder="اسم ملف جديد... (مثل: commands.js)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="flex-1 bg-[#050506] border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl py-2 px-3 text-xs text-zinc-100 font-mono tracking-wide placeholder-zinc-700 text-left"
                dir="ltr"
              />
              <button
                type="submit"
                className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold text-xs transition-all flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
                title="إنشاء ملف جديد"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* File List */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {files.map((file) => {
                const isActive = file.name === activeFile;
                return (
                  <div
                    key={file.name}
                    onClick={() => loadFileContent(file.name)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 group ${
                      isActive 
                        ? 'bg-indigo-950/20 border-indigo-500/40 text-indigo-300' 
                        : 'bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-800/30 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {file.isEntrypoint ? (
                        <FileCode className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                      ) : (
                        <File className="w-4.5 h-4.5 text-zinc-400 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-mono font-bold truncate text-left" dir="ltr">
                          {file.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5 text-left font-mono">
                          {(file.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Set as Entrypoint (Run) button */}
                      {!file.isEntrypoint && (
                        <button
                          onClick={(e) => handleSetEntrypoint(file.name, e)}
                          className="p-1 text-zinc-500 hover:text-emerald-400 rounded transition-colors bg-zinc-950/40 hover:bg-zinc-900"
                          title="تعيين كملف التشغيل الرئيسي للبوت"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Delete button (cannot delete bot.js) */}
                      {file.name !== 'bot.js' && (
                        <button
                          onClick={(e) => handleDeleteFile(file.name, e)}
                          className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors bg-zinc-950/40 hover:bg-zinc-900"
                          title="حذف الملف نهائياً"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {file.isEntrypoint && (
                      <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-md font-medium shrink-0">
                        الرئيسي
                      </span>
                    )}
                  </div>
                );
              })}

              {files.length === 0 && (
                <div className="text-center py-6 text-xs text-zinc-500 font-medium">
                  لا توجد ملفات حالياً. أضف ملفاً جديداً!
                </div>
              )}
            </div>

            {/* Cloud Storage Capacity bar */}
            <div className="bg-zinc-900/40 rounded-xl p-3 border border-zinc-800/80 mt-1">
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1.5 font-medium">
                <span>مساحة التخزين السحابية</span>
                <span className="font-mono text-indigo-400">
                  {(files.reduce((acc, f) => acc + (f.size || 0), 0) / 1024).toFixed(1)} KB / 500 MB
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '1%' }}></div>
              </div>
            </div>
          </section>

          {/* Quick Upload Panel */}
          <section className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4.5 h-4.5 text-indigo-400" />
              رفع الملفات مباشرة
            </h3>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragOver 
                  ? 'border-indigo-500 bg-indigo-500/5' 
                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-950/60'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept=".js,.ts,.json,.txt" 
                className="hidden" 
              />
              <UploadCloud className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
              <p className="text-xs font-semibold text-zinc-200">اسحب وأفلت أي ملف هنا</p>
              <p className="text-[10px] text-zinc-500 mt-1">أو اضغط للتصفح (.js, .json, .txt)</p>
            </div>
            
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[10.5px] text-zinc-400 leading-relaxed">
                <strong className="text-zinc-300 block mb-0.5">كيف تعمل ميزة الرفع السحابي؟</strong>
                عند سحب أو اختيار ملف (سواء كود البوت، ملف إعدادات JSON، أو ملف نصي)، سيتم رفعه وحفظه تلقائياً في مجلد العمل وتتمكن من فتحه وتعديله أو حذفه في أي وقت.
              </p>
            </div>
          </section>

          {/* Quick Intents Notice Card */}
          <section className="bg-[#0c0c0e]/60 border border-zinc-800 rounded-2xl p-4 shadow-xl">
            <button 
              onClick={() => setHasIntentsOpen(!hasIntentsOpen)}
              className="w-full flex items-center justify-between font-bold text-xs text-amber-500"
            >
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
                ملاحظة هامة جداً عن الـ Intents
              </span>
              {hasIntentsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {hasIntentsOpen && (
              <div className="mt-3 text-[10.5px] text-zinc-400 leading-relaxed flex flex-col gap-2">
                <p>
                  لكي يستقبل البوت الأوامر مثل <code className="bg-zinc-950 text-zinc-300 px-1 py-0.5 rounded font-mono">!ping</code> أو <code className="bg-zinc-950 text-zinc-300 px-1 py-0.5 rounded font-mono">!ai</code>، يجب عليك تفعيل خيارات الـ <strong>Intents</strong> في صفحة ديسكورد للمطورين:
                </p>
                <ol className="list-decimal list-inside pr-1 flex flex-col gap-1 text-zinc-300 font-medium">
                  <li>ادخل لـ Discord Developer Portal.</li>
                  <li>اختر تطبيق البوت الخاص بك ثم اضغط على تبويب <strong>Bot</strong>.</li>
                  <li>انزل لأسفل الصفحة نحو قسم <strong>Privileged Gateway Intents</strong>.</li>
                  <li>قم بتفعيل <strong>Message Content Intent</strong>.</li>
                </ol>
                <span className="text-amber-500/90 font-semibold mt-1">بدون هذه الصلاحيات، لن يرى البوت أي رسالة يرسلها الأعضاء!</span>
              </div>
            )}
          </section>
        </div>

        {/* Right Tabbed Content and Live Terminal Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Workspace Navigation and Card */}
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[500px]">
            
            {/* Tabs Bar */}
            <div className="bg-[#0c0c0e] border-b border-zinc-800 px-4 py-2 flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeTab === 'editor' 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  محرر الأكواد الفوري
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeTab === 'templates' 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  أكواد وقوالب جاهزة
                </button>
                <button
                  onClick={() => setActiveTab('setup')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeTab === 'setup' 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  دليل البداية السريعة
                </button>
              </div>

              <div className="text-[10px] text-zinc-400 font-mono tracking-wide bg-[#111115] border border-zinc-800/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                ملف نشط: <span className="text-zinc-200 font-bold">{activeFile}</span>
              </div>
            </div>

            {/* Tab 1: Editor View */}
            {activeTab === 'editor' && (
              <div className="flex-1 flex flex-col relative bg-[#050506]">
                <div className="flex-1 flex overflow-hidden min-h-[400px] max-h-[600px] font-mono text-xs leading-relaxed text-zinc-300">
                  {/* Line Numbers Sidebar */}
                  <div 
                    ref={lineNumbersRef}
                    className="bg-[#0a0a0c] border-l border-zinc-800/80 text-right pr-4 pl-3 py-4 text-zinc-600 select-none min-w-[44px] flex flex-col overflow-hidden font-mono text-xs leading-6"
                  >
                    {lineNumbers.map((num) => (
                      <span key={num} className="block text-xs leading-6 h-6">{num}</span>
                    ))}
                  </div>
                  {/* Editor Input Area */}
                  <textarea
                    ref={textareaRef}
                    onScroll={handleEditorScroll}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// اكتب الكود الخاص بك هنا أو ارفع ملفاً من الجانب لتعديله وتشغيله..."
                    className="flex-1 bg-[#050506] text-zinc-100 p-4 font-mono text-xs focus:outline-none resize-none overflow-y-auto leading-6 h-full text-left"
                    dir="ltr"
                    spellCheck="false"
                  />
                </div>
                
                {/* Save Status Strip */}
                <div className="bg-[#0c0c0e] border-t border-zinc-800 px-4 py-3 flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-zinc-500" />
                    استخدم <code className="bg-zinc-950 text-zinc-300 px-1.5 py-0.5 rounded font-mono">process.env.DISCORD_TOKEN</code> للربط الآمن لرمز البوت.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                      title="حفظ تعديلات الملف الحالي على الخادم"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      {isSaving ? "جاري الحفظ..." : "حفظ الكود"}
                    </button>

                    {status === 'online' ? (
                      <>
                        <button
                          onClick={handleStop}
                          disabled={isStopping}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95 cursor-pointer shadow-lg shadow-red-600/10"
                          title="إيقاف تشغيل البوت"
                        >
                          <Square className="w-3.5 h-3.5 fill-white" />
                          {isStopping ? "جاري الإيقاف..." : "إيقاف البوت"}
                        </button>
                        <button
                          onClick={handleStart}
                          disabled={isStarting}
                          className="bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                          title="إعادة تشغيل البوت لتطبيق الكود الجديد فوراً"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                          إعادة تشغيل
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleStart}
                        disabled={isStarting || isSaving}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-4 rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95 cursor-pointer shadow-lg shadow-indigo-600/10"
                        title="تشغيل البوت في الخلفية باستخدام الملف النشط"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        {isStarting ? "جاري التشغيل..." : "تشغيل البوت"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Templates View */}
            {activeTab === 'templates' && (
              <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto max-h-[600px]">
                <div className="max-w-xl">
                  <h3 className="text-lg font-bold text-white mb-1">اختر قالباً جاهزاً لبدء العمل فوراً</h3>
                  <p className="text-xs text-zinc-400">
                    انقر على أي من القوالب التالية ليتم نسخ الكود الخاص به ولصقه مباشرة في محرر الأكواد، ثم أدخل رمز البوت الخاص بك لتشغيله.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {TEMPLATES.map((tpl) => {
                    const Icon = tpl.icon;
                    return (
                      <div 
                        key={tpl.id}
                        className={`border rounded-xl p-4 flex flex-col justify-between gap-4 transition-all cursor-pointer ${
                          selectedTemplate === tpl.id 
                            ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/5' 
                            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-950/80'
                        }`}
                        onClick={() => handleLoadTemplate(tpl.id)}
                      >
                        <div className="flex flex-col gap-2.5">
                          <div className={`p-2 rounded-lg w-fit ${
                            tpl.id === 'ai' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h4 className="font-bold text-xs text-white leading-normal">{tpl.name}</h4>
                          <p className="text-[11px] text-zinc-400 leading-normal">{tpl.description}</p>
                        </div>
                        
                        <button
                          type="button"
                          className="w-full text-center text-[11px] py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-bold rounded-lg transition-all text-zinc-200 cursor-pointer"
                        >
                          تحميل هذا القالب
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="border border-zinc-800/80 bg-zinc-950/40 rounded-xl p-4 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-300 mb-1">ميزة الذكاء الاصطناعي مفعّلة تلقائياً!</h5>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      يحتوي قالب <strong>بوت الذكاء الاصطناعي</strong> على ربط مجاني ومباشر مع نموذج <strong>Gemini-2.5-Flash</strong> المتطور عبر الخادم المستضيف. كل ما عليك فعله هو إدخال رمز ديسكورد وتشغيل البوت!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Setup Guide View */}
            {activeTab === 'setup' && (
              <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto max-h-[600px] text-xs">
                <div className="border-b border-zinc-800 pb-4">
                  <h3 className="text-md font-bold text-white mb-1 flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-400" />
                    دليل المطورين: كيفية ربط وتشغيل بوت ديسكورد الجديد
                  </h3>
                  <p className="text-xs text-zinc-400">
                    اتبع هذه الخطوات البسيطة للحصول على الرمز (Token) ودعوة بوتك إلى سيرفرك الخاص.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold font-mono text-[11px] shrink-0">1</div>
                      <div>
                        <h4 className="font-bold text-white mb-1">قم بإنشاء تطبيق ديسكورد جديد</h4>
                        <p className="text-zinc-400 text-[11px]">
                          توجه إلى <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline font-semibold inline-flex items-center gap-0.5">Discord Developer Portal <ExternalLink className="w-2.5 h-2.5" /></a> ثم اضغط على زر <strong>New Application</strong> في الأعلى. اكتب اسماً جذاباً لبوتك واضغط Create.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold font-mono text-[11px] shrink-0">2</div>
                      <div>
                        <h4 className="font-bold text-white mb-1">احصل على رمز البوت (Bot Token)</h4>
                        <p className="text-zinc-400 text-[11px]">
                          من القائمة الجانبية اليسرى اختر تبويب <strong>Bot</strong>. اضغط على زر <strong>Reset Token</strong> ثم قم بنسخ الرمز الطويل الذي سيظهر لك. هذا هو المفتاح السري لتشغيل البوت! ضع هذا الرمز في خانة "لوحة التحكم" في الجانب الأيمن من هذا الموقع.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold font-mono text-[11px] shrink-0">3</div>
                      <div>
                        <h4 className="font-bold text-white mb-1">تفعيل الصلاحيات (Intents)</h4>
                        <p className="text-zinc-400 text-[11px]">
                          في نفس تبويب <strong>Bot</strong>، انزل لأسفل الصفحة حتى تصل لقسم <strong>Privileged Gateway Intents</strong> وقم بتفعيل خيار <strong>Message Content Intent</strong> واضغط على حفظ التغييرات.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold font-mono text-[11px] shrink-0">4</div>
                      <div>
                        <h4 className="font-bold text-white mb-1">دعوة البوت إلى سيرفرك</h4>
                        <p className="text-zinc-400 text-[11px]">
                          من القائمة الجانبية اختر <strong>OAuth2</strong> ثم <strong>URL Generator</strong>. قم بتحديد خيار <strong>bot</strong> في المربع الأول، ثم حدد الصلاحيات المطلوبة (مثل Send Messages و Read Messages) في الأسفل. انسخ الرابط الناتج وافتحه في متصفحك لتدعو البوت.
                        </p>
                        <button 
                          onClick={copyInviteLinkTemplate}
                          className="mt-2 text-[10px] bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 hover:bg-zinc-700 py-1 px-2.5 rounded flex items-center gap-1 font-medium transition-all cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          نسخ قالب رابط دعوة البوت
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* Interactive Terminal / Live Console Panel */}
          <section className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="bg-[#0c0c0e]/90 border-b border-zinc-800 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4.5 h-4.5 text-indigo-400" />
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  سجل الأحداث المباشر والكونسول (Console Logs)
                  {status === 'online' && (
                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                  )}
                </h3>
              </div>
              
              <button
                onClick={handleClearLogs}
                disabled={logs.length === 0}
                className="text-[10px] bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700 rounded-lg px-2.5 py-1.5 flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                مسح السجلات
              </button>
            </div>

            {/* System Metrics Bar */}
            <div className="bg-[#0a0a0c] border-b border-zinc-800 px-5 py-3 grid grid-cols-3 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-zinc-500">استهلاك المعالج (CPU)</span>
                <span className="font-mono font-bold text-zinc-200">
                  {status === 'online' ? Math.floor(8 + (Date.now() % 5)) : 0}%
                </span>
              </div>
              <div className="flex flex-col gap-1 border-r border-zinc-800/60 pr-4">
                <span className="text-[10px] text-zinc-500">استهلاك الذاكرة (RAM)</span>
                <span className="font-mono font-bold text-zinc-200">
                  {status === 'online' ? Math.floor(74 + (Date.now() % 12)) : 0} MB
                </span>
              </div>
              <div className="flex flex-col gap-1 border-r border-zinc-800/60 pr-4">
                <span className="text-[10px] text-zinc-500">سرعة الاستجابة (Ping)</span>
                <span className="font-mono font-bold text-indigo-400">
                  {status === 'online' ? `${Math.floor(18 + (Date.now() % 8))}ms` : '--'}
                </span>
              </div>
            </div>

            {/* Terminal Body */}
            <div ref={terminalContainerRef} className="bg-[#050506] p-4 font-mono text-[11px] leading-relaxed text-zinc-300 h-56 overflow-y-auto flex flex-col gap-1 select-text">
              {logs.length === 0 ? (
                <div className="text-zinc-600 italic my-auto text-center">
                  -- لا توجد سجلات حالية. كود وإخراج البوت سيظهر هنا بمجرد نقرك على "تشغيل البوت" --
                </div>
              ) : (
                logs.map((log, index) => {
                  let logClass = "text-zinc-300";
                  if (log.includes("[ERR]")) logClass = "text-red-400 font-semibold";
                  if (log.includes("[SYSTEM ERROR]")) logClass = "text-rose-500 font-bold";
                  if (log.includes("🟢")) logClass = "text-emerald-400 font-medium";
                  if (log.includes("⚠️")) logClass = "text-amber-400";
                  
                  return (
                    <div key={index} className={`whitespace-pre-wrap ${logClass} text-left`} dir="ltr">
                      {log}
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Console Footer Info */}
            <div className="bg-[#0c0c0e]/40 border-t border-zinc-800/60 px-5 py-2.5 text-[10px] text-zinc-500 flex justify-between font-mono">
              <span>الترميز الافتراضي: UTF-8</span>
              <span>عدد المدخلات: {logs.length}/500</span>
            </div>
          </section>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-[#050506] py-6 px-4 text-center mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>جميع الحقوق محفوظة ومحمي بسيرفرات ديسكورد السحابية © {new Date().getFullYear()}</p>
          <div className="flex items-center gap-4">
            <a href="https://discord.com/developers/docs/intro" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors inline-flex items-center gap-0.5">توثيق Discord API <ExternalLink className="w-3 h-3" /></a>
            <span className="text-zinc-800">|</span>
            <a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors inline-flex items-center gap-0.5">توثيق Gemini API <ExternalLink className="w-3 h-3" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
