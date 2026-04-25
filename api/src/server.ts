import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import knex from "knex";
import knexConfig from "../knexfile.js";
import { WaterService } from "./services/waterService.js";

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
app.put("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const { name, weight, height, age, gender } = req.body;
    const { id } = req.params;

    if (!weight || !height || !age) {
      return res.status(400).json({ error: "Missing required fields for calculation" });
    }

    const waterGoal = WaterService.calculateGoal(weight, height, age);

    const [updatedUser] = await db("users").where({ id }).update({
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

// 3. Get User Profile
app.post("/api/intake", async (req: Request, res: Response) => {
  try {
    const { user_id, amount_ml } = req.body;
    await db("intake_history").insert({ user_id, amount_ml });
    res.status(201).json({ message: "Intake logged" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 4. Get Daily Progress
app.get("/api/users/:id/progress", async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
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
app.delete("/api/users/:id/progress/today", async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
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
