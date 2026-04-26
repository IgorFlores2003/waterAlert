import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import knex from "knex";
import knexConfig from "../knexfile.js";
import { WaterService } from "./services/waterService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { EmailService } from "./services/emailService.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import type { AuthRequest } from "./middleware/authMiddleware.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-123";

const app = express();

const env = process.env.NODE_ENV || "development";
console.log(`🚀 Starting in environment: ${env}`);
console.log(`DATABASE_URL present: ${!!process.env.DATABASE_URL}`);

const db = knex(knexConfig[env]!);

// Test connection
db.raw('SELECT 1').then(() => {
  console.log('✅ Database connected successfully');
}).catch((err) => {
  console.error('❌ Database connection failed:', err);
});

app.use(cors());
app.use(express.json());

// Auth Routes

// Signup
app.post("/api/auth/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password, weight, height, age, gender } = req.body;

    if (!email || !password || !name || !weight || !height || !age) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    const userExists = await db("users").where({ email }).first();
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const waterGoal = WaterService.calculateGoal(weight, height, age);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const [user] = await db("users").insert({
      name,
      email,
      password: hashedPassword,
      weight,
      height,
      age,
      gender,
      water_goal_ml: waterGoal,
      verification_code: verificationCode,
      is_verified: false
    }).returning("*");

    // Send verification email
    await EmailService.sendVerificationEmail(email, name, verificationCode);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Verification Route
app.post("/api/auth/verify", async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "E-mail e código são obrigatórios." });
    }

    const user = await db("users").where({ email }).first();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.verification_code !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    await db("users").where({ email }).update({
      is_verified: true,
      verification_code: null
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

    res.json({ 
      message: "Email verified successfully", 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        water_goal_ml: user.water_goal_ml
      },
      token 
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await db("users").where({ email }).first();
    if (!user || !user.password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

    res.json({ user, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Routes

// 1. Calculate and Register User
app.post("/api/users", async (req: Request, res: Response) => {
  try {
    const { name, weight, height, age, gender } = req.body;
    
    if (!name || !weight || !height || !age) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const waterGoal = WaterService.calculateGoal(weight, height, age);

    const [user] = await db("users").insert({
      name,
      weight,
      height,
      age,
      gender,
      water_goal_ml: waterGoal
    }).returning("*");

    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// 2. Update User Profile
app.put("/api/users/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, weight, height, age, gender } = req.body;
    const userId = req.user?.id;

    if (!weight || !height || !age) {
      return res.status(400).json({ error: "Missing required fields for calculation" });
    }

    const waterGoal = WaterService.calculateGoal(weight, height, age);

    const [updatedUser] = await db("users").where({ id: userId }).update({
      name,
      weight,
      height,
      age,
      gender,
      water_goal_ml: waterGoal,
      updated_at: db.fn.now()
    }).returning("*");

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 6. Get User Profile
app.get("/api/users/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = await db("users").where({ id: userId }).first();
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, verification_code, ...publicUser } = user;
    res.json(publicUser);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 3. Log Intake
app.post("/api/intake", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { amount_ml } = req.body;
    const userId = req.user?.id;
    await db("intake_history").insert({ user_id: userId, amount_ml });
    res.status(201).json({ message: "Intake logged" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 4. Get Daily Progress
app.get("/api/users/progress", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const history = await db("intake_history")
      .where({ user_id: userId })
      .whereRaw("consumed_at::date = CURRENT_DATE");
    
    const total = history.reduce((acc, curr) => acc + curr.amount_ml, 0);
    res.json({ total_consumed: total });
  } catch (error) {
    console.error("Error getting progress:", error);
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: error instanceof Error ? error.message : JSON.stringify(error) 
    });
  }
});

// 5. Reset Daily Progress
app.delete("/api/users/progress/today", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    await db("intake_history")
      .where({ user_id: userId })
      .whereRaw("consumed_at::date = CURRENT_DATE")
      .del();
    
    res.json({ message: "Daily progress reset" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
