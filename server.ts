import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("plates.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS centers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS plates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plate_number TEXT NOT NULL UNIQUE,
    center_id INTEGER,
    production_date TEXT,
    status TEXT DEFAULT 'issued',
    FOREIGN KEY (center_id) REFERENCES centers(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS public_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    otp_code TEXT,
    is_verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed data if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
  insertUser.run("basnko59", "swsa337745", "mrorko701@gmail.com");
}

// Seed data if empty
const centerCount = db.prepare("SELECT COUNT(*) as count FROM centers").get() as { count: number };
if (centerCount.count === 0) {
  const centers = [
    "ترخيص شرق النيل",
    "ترخيص المقرن",
    "ترخيص امبده",
    "ترخيص العلاقات البينية",
    "ترخيص الكرامة",
    "ترخيص مجمع خدمات الجمهور ام درمان",
    "ترخيص جبره",
    "ترخيص ابو ادم"
  ];

  const insertCenter = db.prepare("INSERT INTO centers (name) VALUES (?)");
  centers.forEach(name => insertCenter.run(name));

  const insertPlate = db.prepare("INSERT INTO plates (plate_number, center_id, production_date, status) VALUES (?, ?, ?, ?)");
  
  // Generate some mock plates
  const letters = ["أ", "ب", "ج", "د", "هـ", "و", "ز", "ح", "ط", "ي", "خ"];
  for (let i = 1; i <= centers.length; i++) {
    for (let j = 1; j <= 20; j++) {
      let plateStr = "";
      const type = Math.random();
      
      if (type < 0.4) {
        // Specific format: "خ3/1239"
        const l = letters[Math.floor(Math.random() * letters.length)];
        const n1 = Math.floor(1 + Math.random() * 9);
        const n2 = Math.floor(1000 + Math.random() * 8999);
        plateStr = `${l}${n1}/${n2}`;
      } else if (type < 0.7) {
        // Letter + Numbers: "أ 123"
        const num = Math.floor(1 + Math.random() * 9999);
        plateStr = `${letters[Math.floor(Math.random() * letters.length)]} ${num}`;
      } else {
        // Letters only: "أ ب ج"
        plateStr = `${letters[Math.floor(Math.random() * letters.length)]} ${letters[Math.floor(Math.random() * letters.length)]} ${letters[Math.floor(Math.random() * letters.length)]}`;
      }
      
      const status = Math.random() > 0.3 ? 'issued' : 'pending';
      
      try {
        insertPlate.run(plateStr, i, new Date().toISOString().split('T')[0], status);
      } catch (e) {
        // Skip duplicates
      }
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    
    if (user) {
      res.json({ success: true, user: { username: user.username, email: user.email, role: 'admin' } });
    } else {
      res.status(401).json({ error: "خطأ في اسم المستخدم أو كلمة المرور" });
    }
  });

  // Public User Auth
  app.post("/api/auth/register", (req, res) => {
    const { full_name, phone } = req.body;
    if (!full_name || !phone) return res.status(400).json({ error: "الاسم ورقم الهاتف مطلوبان" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      const stmt = db.prepare("INSERT INTO public_users (full_name, phone, otp_code) VALUES (?, ?, ?)");
      stmt.run(full_name, phone, otp);
      
      // Simulate sending SMS
      console.log(`[SMS Simulation] To: ${phone}, Message: رمز التفعيل الخاص بك هو ${otp}`);
      
      res.json({ success: true, message: "تم إرسال رمز التفعيل", mock_otp: otp });
    } catch (error: any) {
      if (error.message.includes("UNIQUE constraint failed")) {
        // If already exists but not verified, update OTP
        const updateStmt = db.prepare("UPDATE public_users SET otp_code = ? WHERE phone = ? AND is_verified = 0");
        const info = updateStmt.run(otp, phone);
        if (info.changes > 0) {
          console.log(`[SMS Simulation] To: ${phone}, Message: رمز التفعيل الجديد هو ${otp}`);
          return res.json({ success: true, message: "تم إعادة إرسال رمز التفعيل", mock_otp: otp });
        }
        res.status(400).json({ error: "رقم الهاتف مسجل مسبقاً" });
      } else {
        res.status(500).json({ error: "حدث خطأ أثناء التسجيل" });
      }
    }
  });

  app.post("/api/auth/verify", (req, res) => {
    const { phone, otp } = req.body;
    const user = db.prepare("SELECT * FROM public_users WHERE phone = ? AND otp_code = ?").get(phone, otp) as any;
    
    if (user) {
      db.prepare("UPDATE public_users SET is_verified = 1, otp_code = NULL WHERE id = ?").run(user.id);
      res.json({ success: true, user: { full_name: user.full_name, phone: user.phone, role: 'user' } });
    } else {
      res.status(400).json({ error: "رمز التفعيل غير صحيح" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { phone } = req.body;
    const user = db.prepare("SELECT * FROM public_users WHERE phone = ? AND is_verified = 1").get(phone) as any;
    
    if (user) {
      res.json({ success: true, user: { full_name: user.full_name, phone: user.phone, role: 'user' } });
    } else {
      res.status(401).json({ error: "رقم الهاتف غير مسجل أو لم يتم تفعيله" });
    }
  });

  app.post("/api/plates/bulk", (req, res) => {
    const { plates } = req.body;
    
    if (!Array.isArray(plates) || plates.length === 0) {
      return res.status(400).json({ error: "بيانات غير صالحة" });
    }

    const insertPlate = db.prepare("INSERT INTO plates (plate_number, center_id, production_date, status) VALUES (?, ?, ?, 'issued')");
    
    const transaction = db.transaction((records) => {
      for (const record of records) {
        insertPlate.run(record.plate_number, record.center_id, record.production_date);
      }
    });

    try {
      transaction(plates);
      res.json({ success: true, count: plates.length });
    } catch (error: any) {
      res.status(500).json({ error: "حدث خطأ أثناء الحفظ الجماعي: " + error.message });
    }
  });

  app.get("/api/centers", (req, res) => {
    const stmt = db.prepare("SELECT * FROM centers");
    res.json(stmt.all());
  });

  app.post("/api/plates", (req, res) => {
    const { plate_number, center_id, production_date } = req.body;
    
    if (!plate_number || !center_id || !production_date) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }

    try {
      const stmt = db.prepare("INSERT INTO plates (plate_number, center_id, production_date, status) VALUES (?, ?, ?, 'issued')");
      stmt.run(plate_number, center_id, production_date);
      res.json({ success: true });
    } catch (error: any) {
      if (error.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ error: "رقم اللوحة موجود مسبقاً" });
      } else {
        res.status(500).json({ error: "حدث خطأ أثناء الحفظ" });
      }
    }
  });

  app.get("/api/search", (req, res) => {
    const q = req.query.q as string;
    if (!q) {
      return res.json([]);
    }

    const stmt = db.prepare(`
      SELECT plates.plate_number, centers.name as center_name, plates.production_date, plates.status
      FROM plates
      JOIN centers ON plates.center_id = centers.id
      WHERE plates.plate_number LIKE ?
      LIMIT 10
    `);
    
    const results = stmt.all(`%${q}%`);
    res.json(results);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // Changed to custom to handle index.html manually
    });
    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await fs.promises.readFile(
          path.resolve(__dirname, "index.html"),
          "utf-8"
        );
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
