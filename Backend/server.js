require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect frontend requests to the backend
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Connect to Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    console.error("Please configure SUPABASE_URL and SUPABASE_SECRET_KEY in your .env file.");
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

// Test whether the backend is running
app.get("/", (req, res) => {
    res.send("RecipeShare backend is running successfully!");
});

// Get all recipes
app.get("/api/recipes", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("recipes")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error.message);
            return res.status(500).json({
                message: "Unable to retrieve recipes."
            });
        }

        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Server error."
        });
    }
});

// Add a new recipe
app.post("/api/recipes", async (req, res) => {
    try {
        const {
            name,
            ingredients,
            cooking_time,
            instructions,
            image_url
        } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            !Array.isArray(ingredients) ||
            ingredients.length === 0 ||
            !ingredients.every(
                item => typeof item === "string" && item.trim()
            ) ||
            !Number.isInteger(cooking_time) ||
            cooking_time < 1 ||
            cooking_time > 1440 ||
            typeof instructions !== "string" ||
            !instructions.trim()
        ) {
            return res.status(400).json({
                message: "Please provide a valid recipe name, ingredients, cooking time, and instructions."
            });
        }

        const { data, error } = await supabase
            .from("recipes")
            .insert([{
                name: name.trim(),
                ingredients: ingredients.map(item => item.trim()),
                cooking_time,
                instructions: instructions.trim(),
                image_url: image_url || null
            }])
            .select()
            .single();

        if (error) {
            console.error(error.message);
            return res.status(500).json({
                message: "Unable to save the recipe."
            });
        }

        res.status(201).json({
            message: "Recipe added successfully!",
            recipe: data
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Server error."
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`RecipeShare backend running at http://localhost:${PORT}`);
});
