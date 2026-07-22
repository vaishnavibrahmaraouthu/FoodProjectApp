const axios = require("axios");

exports.generateDishDescription = async ({
  name,
  category,
  spiceLevel,
  price,
}) => {
  const prompt = `
You are a professional food classification assistant.

Generate ONLY valid JSON.
No markdown.
No explanation text.

IMPORTANT RULES:
- Tags must be accurate restaurant-style tags
- Do NOT misclassify dishes
- Do NOT label main courses as desserts
- Allergens must be realistic
- Serves must be realistic (1 or 2)
- bestFor must be meal timings only

Dish Name: ${name}
Category: ${category}
Spice Level: ${spiceLevel}
Base Price: ${price}

Return JSON in this EXACT format:
{
  "description": "string",
  "tags": ["string"],
  "allergens": ["string"],
  "serves": "string",
  "bestFor": ["string"]
}
`;

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 300,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return JSON.parse(response.data.choices[0].message.content);
};

const getNutritionLevel = ({ calories, protein, carbs, fat }) => {
  const normalizedCalories = Number(calories) || 0;
  const normalizedProtein = Number(protein) || 0;
  const normalizedCarbs = Number(carbs) || 0;
  const normalizedFat = Number(fat) || 0;

  const proteinScore = normalizedProtein >= 22 ? 1 : normalizedProtein >= 14 ? 0.5 : 0;
  const carbScore = normalizedCarbs >= 80 ? 1 : normalizedCarbs >= 45 ? 0.5 : 0;
  const fatScore = normalizedFat >= 28 ? 1 : normalizedFat >= 16 ? 0.5 : 0;
  const energyScore = normalizedCalories >= 900 ? 1 : normalizedCalories >= 600 ? 0.5 : 0;

  const loadScore = proteinScore + carbScore + fatScore + energyScore;

  if (normalizedCalories <= 450 && normalizedFat <= 14 && normalizedProtein >= 16 && normalizedCarbs <= 45) {
    return "Healthy Choice";
  }

  if (loadScore <= 1 && normalizedCalories <= 700 && normalizedFat <= 24) {
    return "Moderate";
  }

  if (loadScore <= 2 && normalizedCalories <= 900 && normalizedFat <= 36) {
    return "Indulgent";
  }

  return "Treat";
};

exports.getNutritionLevel = getNutritionLevel;

const getFoodSpecificInsight = ({ name, nutritionLevel }) => {
  const normalizedName = String(name || "this dish").trim().toLowerCase();
  const level = String(nutritionLevel || "Moderate").toLowerCase();
  const isHeavy = level === "indulgent" || level === "treat";
  const isLight = level === "healthy choice";

  const hasSaladLikeDish = /salad|soup|wrap|bowl|grilled|starter/i.test(normalizedName);
  const hasHeavyDish = /burger|pizza|biryani|pasta|noodle|fries|sandwich|roll|taco|shake|dessert|cake|pastry/i.test(normalizedName);
  const hasRiceDish = /rice|biryani|pulao|fried rice/i.test(normalizedName);
  const hasDessert = /dessert|cake|pastry|ice cream|shake|sweet/i.test(normalizedName);
  const hasProteinForward = /chicken|fish|egg|paneer|tofu|meat|keema|steak/i.test(normalizedName);

  const baseName = normalizedName.replace(/\b(the|a|an)\b/g, "").trim();
  const displayName = baseName || "this dish";

  if (hasDessert) {
    return isHeavy
      ? `This ${displayName} is a rich sweet treat, so sharing it or pairing it with a lighter bite makes the meal feel more balanced.`
      : `This ${displayName} is a sweet treat, and enjoying it in a small portion keeps it satisfying without feeling too heavy.`;
  }

  if (hasSaladLikeDish) {
    return isLight
      ? `This ${displayName} feels fresh and light, and adding a warm side makes it more filling for a complete meal.`
      : `This ${displayName} feels refreshing, and pairing it with a hearty side makes the meal feel more complete and satisfying.`;
  }

  if (hasHeavyDish) {
    return isHeavy
      ? `This ${displayName} is rich and filling, so sharing it with a fresh side keeps the meal balanced and enjoyable.`
      : `This ${displayName} is hearty, and pairing it with a simple side makes it feel more balanced without being too much.`;
  }

  if (hasRiceDish) {
    return isHeavy
      ? `This ${displayName} is quite hearty, so adding a fresh side or a lighter topping helps keep the meal from feeling too heavy.`
      : `This ${displayName} is filling, and adding a fresh side makes it feel more balanced and easier to enjoy.`;
  }

  if (hasProteinForward) {
    return isLight
      ? `This ${displayName} feels wholesome and satisfying, and a simple side can make it feel even more complete.`
      : `This ${displayName} is packed with substance, and a lighter side helps round out the meal nicely.`;
  }

  if (isHeavy) {
    return `This ${displayName} feels indulgent, so sharing it or pairing it with a lighter side is a smart choice.`;
  }

  if (isLight) {
    return `This ${displayName} feels light and balanced, and a simple side can make it even more satisfying.`;
  }

  return `This ${displayName} feels well-rounded, and a fresh side can make the meal even more enjoyable.`;
};

exports.getNutritionInsight = getFoodSpecificInsight;

exports.generateNutritionAnalysis = async ({ name, calories, protein, carbs, fat }) => {
  const nutritionLevel = getNutritionLevel({
    calories,
    protein,
    carbs,
    fat,
  });

  const insight = getFoodSpecificInsight({ name, nutritionLevel });

  return {
    nutritionLevel,
    insight,
  };
};