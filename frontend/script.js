// ========================================
// 1. SAMPLE RECIPES
// ========================================

const sampleRecipes = [
    {
        id: 1,
        name: "Tomato Rice",
        ingredients: ["rice", "tomato", "onion", "oil", "salt"],
        time: 20,
        instructions:
            "1. Cook the rice.\n" +
            "2. Fry chopped onion and tomato in oil.\n" +
            "3. Add salt and mix with the cooked rice.",
        emoji: "🍅",
        image: ""
    },

    {
        id: 2,
        name: "Vegetable Fried Rice",
        ingredients: ["rice", "carrot", "onion", "oil", "salt"],
        time: 25,
        instructions:
            "1. Cook the rice.\n" +
            "2. Fry chopped vegetables.\n" +
            "3. Add rice and salt, then mix well.",
        emoji: "🍚",
        image: ""
    },

    {
        id: 3,
        name: "Potato Curry",
        ingredients: ["potato", "onion", "tomato", "oil", "salt"],
        time: 30,
        instructions:
            "1. Boil and chop the potatoes.\n" +
            "2. Fry onion and tomato.\n" +
            "3. Add potato, salt and a little water.\n" +
            "4. Cook until ready.",
        emoji: "🥔",
        image: ""
    },

    {
        id: 4,
        name: "Simple Tomato Salad",
        ingredients: ["tomato", "onion", "salt", "lemon"],
        time: 10,
        instructions:
            "1. Wash the vegetables.\n" +
            "2. Chop tomato and onion.\n" +
            "3. Add salt and lemon juice, then mix.",
        emoji: "🥗",
        image: ""
    }
];


// ========================================
// 2. LOAD AND SAVE RECIPES
// ========================================

const STORAGE_KEY = "recipeShareRecipes";

function loadRecipes() {
    try {
        const savedRecipes = localStorage.getItem(STORAGE_KEY);

        if (savedRecipes !== null) {
            const parsedRecipes = JSON.parse(savedRecipes);

            if (Array.isArray(parsedRecipes)) {
                return parsedRecipes;
            }
        }
    } catch (error) {
        console.error("Could not load saved recipes:", error);
    }

    return sampleRecipes.map(function(recipe) {
        return { ...recipe };
    });
}

let recipes = sampleRecipes.map(function(recipe) {
    return { ...recipe };
});

function saveRecipes() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(recipes)
        );

        return true;

    } catch (error) {
        console.error("Could not save recipes:", error);

        return false;
    }
}
const API_URL = "http://localhost:3000";

function formatRecipe(recipe) {
    return {
        id: recipe.id,
        name: recipe.name,
        ingredients: recipe.ingredients,
        time: recipe.cooking_time ?? recipe.time,
        instructions: recipe.instructions,
        emoji: "🍽️",
        image: recipe.image_url || recipe.image || ""
    };
}

async function loadRecipesFromBackend() {
    const resultMessage = document.getElementById("resultMessage");

    try {
        const response = await fetch(`${API_URL}/api/recipes`);

        if (!response.ok) {
            throw new Error("Could not load recipes");
        }

        const data = await response.json();

        if (data.length > 0) {
            recipes = data.map(formatRecipe);
        }

        displayRecipes(recipes);

    } catch (error) {
        console.error("Backend connection failed:", error);

        resultMessage.textContent =
            "Could not connect to the backend. Please check that your server is running.";

        displayRecipes(recipes);
    }
}

// ========================================
// 3. DISPLAY RECIPES
// ========================================

function displayRecipes(recipeList, searchIngredients = []) {

    const recipeContainer = document.getElementById("recipeList");
    const resultMessage = document.getElementById("resultMessage");

    recipeContainer.replaceChildren();

    if (recipeList.length === 0) {
        resultMessage.textContent =
            "No matching recipes found. Try different ingredients.";

        return;
    }

    resultMessage.textContent =
        recipeList.length + " recipe(s) found!";

    recipeList.forEach(function(recipe) {

        const card = document.createElement("article");
        card.className = "recipe-card";

        // Recipe image or emoji
        const imageArea = document.createElement("div");
        imageArea.className = "recipe-image";

        if (recipe.image) {

            const image = document.createElement("img");

            image.src = recipe.image;
            image.alt = recipe.name;
            image.loading = "lazy";

            imageArea.appendChild(image);

        } else {

            imageArea.textContent = recipe.emoji || "🍽️";

        }

        // Recipe details
        const content = document.createElement("div");
        content.className = "recipe-content";

        const title = document.createElement("h3");
        title.textContent = recipe.name;

        const ingredients = document.createElement("p");
        ingredients.textContent =
            "Ingredients: " + recipe.ingredients.join(", ");

        const time = document.createElement("p");
        time.textContent =
            "⏱ Cooking time: " + recipe.time + " minutes";

        content.appendChild(title);
        content.appendChild(ingredients);
        content.appendChild(time);

        // Matching ingredient information
        if (searchIngredients.length > 0) {

            const matchingIngredients = recipe.ingredients.filter(
                function(ingredient) {
                    return searchIngredients.includes(ingredient);
                }
            );

            const matchInfo = document.createElement("p");
            matchInfo.className = "match-info";

            matchInfo.textContent =
                "Matching ingredients: " +
                matchingIngredients.length +
                " of " +
                searchIngredients.length;

            content.appendChild(matchInfo);
        }

        // View Recipe button
        const viewButton = document.createElement("button");

        viewButton.type = "button";
        viewButton.textContent = "View Recipe";

        viewButton.addEventListener("click", function() {

            alert(
                recipe.name +
                "\n\nIngredients:\n" +
                recipe.ingredients.join(", ") +
                "\n\nCooking time: " +
                recipe.time +
                " minutes\n\nInstructions:\n" +
                recipe.instructions
            );

        });

        content.appendChild(viewButton);

        card.appendChild(imageArea);
        card.appendChild(content);

        recipeContainer.appendChild(card);
    });
}


// ========================================
// 4. SEARCH RECIPES
// ========================================

function searchRecipes() {

    const input = document
        .getElementById("ingredientInput")
        .value
        .trim()
        .toLowerCase();

    if (input === "") {
        alert("Please enter a recipe name or ingredients.");
        return;
    }

    const searchTerms = input
        .split(",")
        .map(function(item) {
            return item.trim();
        })
        .filter(function(item) {
            return item !== "";
        });

    if (searchTerms.length === 0) {
        alert("Please enter valid search terms.");
        return;
    }

    // First, check for recipe name matches
    const nameMatches = recipes.filter(function(recipe) {

        return recipe.name.toLowerCase().includes(input);

    });

    if (nameMatches.length > 0) {

        displayRecipes(nameMatches);
        return;
    }

    // Search recipes using ingredients
    const matchedRecipes = recipes
        .map(function(recipe) {

            const matchedCount = recipe.ingredients.filter(
                function(ingredient) {

                    return searchTerms.includes(ingredient);

                }
            ).length;

            return {
                recipe: recipe,
                matchedCount: matchedCount
            };

        })
        .filter(function(item) {
            return item.matchedCount > 0;
        })
        .sort(function(a, b) {
            return b.matchedCount - a.matchedCount;
        });

    const sortedRecipes = matchedRecipes.map(function(item) {
        return item.recipe;
    });

    displayRecipes(sortedRecipes, searchTerms);
}


// ========================================
// 5. SHOW ALL RECIPES
// ========================================

function showAllRecipes() {

    document.getElementById("ingredientInput").value = "";

    displayRecipes(recipes);
}


// ========================================
// 6. ADD A NEW RECIPE
// ========================================

document
    .getElementById("recipeForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const name = document
            .getElementById("recipeName")
            .value
            .trim();

        const ingredientsText = document
            .getElementById("recipeIngredients")
            .value
            .trim();

        const time = Number(
            document.getElementById("recipeTime").value
        );

        const instructions = document
            .getElementById("recipeInstructions")
            .value
            .trim();

        const imageInput = document.getElementById("recipeImage");

        const formMessage = document.getElementById("formMessage");

        formMessage.textContent = "";

        // Validate recipe details
        if (
            name === "" ||
            ingredientsText === "" ||
            instructions === "" ||
            !Number.isInteger(time) ||
            time < 1 ||
            time > 1440
        ) {

            formMessage.textContent =
                "Please enter valid recipe details.";

            return;
        }

        // Prepare ingredients
        const ingredients = ingredientsText
            .split(",")
            .map(function(item) {
                return item.trim().toLowerCase();
            })
            .filter(function(item) {
                return item !== "";
            });

        if (ingredients.length === 0) {

            formMessage.textContent =
                "Please enter at least one ingredient.";

            return;
        }

        // Prevent duplicate ingredient entries
        const uniqueIngredients = [...new Set(ingredients)];

        // Read optional recipe image
        let imageData = "";

        const imageFile = imageInput.files[0];

        if (imageFile) {

            if (!imageFile.type.startsWith("image/")) {

                formMessage.textContent =
                    "Please select a valid image file.";

                return;
            }

            // Limit uploaded images to 1 MB
            if (imageFile.size > 1024 * 1024) {

                formMessage.textContent =
                    "Please choose an image smaller than 1 MB.";

                return;
            }

            try {

                imageData = await new Promise(function(resolve, reject) {

                    const reader = new FileReader();

                    reader.onload = function() {
                        resolve(reader.result);
                    };

                    reader.onerror = function() {
                        reject(new Error("Image reading failed."));
                    };

                    reader.readAsDataURL(imageFile);

                });

            } catch (error) {

                formMessage.textContent =
                    "Could not read the image. Please try again.";

                return;
            }
        }

        // Create recipe object
        const newRecipe = {

            id: Date.now(),

            name: name,

            ingredients: uniqueIngredients,

            time: time,

            instructions: instructions,

            emoji: "🍽️",

            image: imageData

        };
        // Add recipe to the backend
try {
    const response = await fetch(`${API_URL}/api/recipes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: newRecipe.name,
            ingredients: newRecipe.ingredients,
            cooking_time: newRecipe.time,
            instructions: newRecipe.instructions,
            image_url: newRecipe.image || null
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to save recipe");
    }

    // Convert backend recipe format to frontend format
    const savedRecipe = {
        id: data.id,
        name: data.name,
        ingredients: data.ingredients,
        time: data.cooking_time,
        instructions: data.instructions,
        emoji: "🍽️",
        image: data.image_url || ""
    };

    recipes.push(savedRecipe);

    document.getElementById("recipeForm").reset();
    displayRecipes(recipes);

    formMessage.textContent = "Recipe added successfully! ❤️";

} catch (error) {
    console.error("Error saving recipe:", error);

    formMessage.textContent =
        "Could not save the recipe. Please check whether the backend is running.";
}

        

        

        // Show the newly added recipe section
        document.getElementById("recipes").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });


// ========================================
// 7. DISPLAY RECIPES ON PAGE LOAD
// ========================================

loadRecipesFromBackend();