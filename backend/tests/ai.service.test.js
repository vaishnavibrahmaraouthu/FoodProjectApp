const test = require("node:test");
const assert = require("node:assert/strict");
const { getNutritionLevel, getNutritionInsight } = require("../services/ai.service");

test("classifies balanced protein-rich meals as healthier than rich carb-heavy meals", () => {
  const balancedMeal = getNutritionLevel({ calories: 420, protein: 28, carbs: 38, fat: 14 });
  const richDessert = getNutritionLevel({ calories: 780, protein: 4, carbs: 95, fat: 32 });

  assert.equal(balancedMeal, "Healthy Choice");
  assert.equal(richDessert, "Treat");
});

test("builds dish-specific suggestions for richer foods", () => {
  const insight = getNutritionInsight({ name: "Chicken Burger", nutritionLevel: "Treat" });

  assert.match(insight, /sharing|fresh side|balanced/i);
  assert.match(insight, /burger/i);
});
