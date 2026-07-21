const Restaurant = require("../models/restaurant");
const Fooditem = require("../models/foodItem");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");

exports.getAllRestaurants = catchAsync(async (req, res, next) => {
  const { keyword, cuisine, sortBy, searchType } = req.query;

  let queryConditions = [];
  let matchingFoodItemsWithRest = [];
  const normalizedSearchType = (searchType || "all").toLowerCase();
  const isFoodSearch = normalizedSearchType === "fooditem" || normalizedSearchType === "food-items" || normalizedSearchType === "food";
  const isRestaurantSearch = normalizedSearchType === "restaurant" || normalizedSearchType === "restaurants";
  const shouldSearchFoodItems = !isRestaurantSearch;
  const shouldSearchRestaurants = !isFoodSearch;

  // 1. Filter by Cuisine if specified and not 'All'
  if (cuisine && cuisine.trim() !== "" && cuisine !== "All") {
    queryConditions.push({
      cuisine: { $regex: cuisine.trim(), $options: "i" },
    });
  }

  // 2. Search by Keyword (Name, Address, or Food Item Name/Description)
  if (keyword && keyword.trim() !== "") {
    const kw = keyword.trim();
    const words = kw.split(/\s+/).filter(Boolean);
    
    // Create multi-word pattern so "chicken biryani" matches "Chicken Dum Biryani", "Special Chicken Biryani", etc.
    const wordPattern = words.map((w) => `(?=.*${w})`).join("");
    const regexQuery = { $regex: wordPattern, $options: "i" };
    const simpleRegex = { $regex: kw, $options: "i" };

    if (shouldSearchFoodItems) {
      // Find food items matching keyword and populate restaurant details
      matchingFoodItemsWithRest = await Fooditem.find({
        $or: [
          { name: simpleRegex },
          { name: regexQuery },
          { description: simpleRegex },
        ],
      }).populate("restaurant");
    }

    if (shouldSearchRestaurants) {
      const restaurantIdsFromFood = matchingFoodItemsWithRest
        .map((item) => item.restaurant?._id || item.restaurant)
        .filter(Boolean);

      queryConditions.push({
        $or: [
          { name: simpleRegex },
          { name: regexQuery },
          { address: simpleRegex },
          ...(restaurantIdsFromFood.length > 0
            ? [{ _id: { $in: restaurantIdsFromFood } }]
            : []),
        ],
      });
    }
  }

  const findQuery =
    queryConditions.length > 0 ? { $and: queryConditions } : {};

  let restaurants = [];

  if (!keyword || !keyword.trim() || shouldSearchRestaurants) {
    let query = Restaurant.find(findQuery);

    if (sortBy === "ratings") {
      query = query.sort({ ratings: -1 });
    } else if (sortBy === "reviews") {
      query = query.sort({ numOfReviews: -1 });
    }

    restaurants = await query;
  }

  res.status(200).json({
    status: "success",
    count: restaurants.length,
    restaurants: restaurants,
    foodItems: matchingFoodItemsWithRest,
  });
});

exports.createRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.create(req.body);
  res.status(201).json({
    status: "success",
    data: restaurant,
  });
});

//Get restaurant by id
exports.getRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.storeId);

  if (!restaurant)
    return next(new ErrorHandler("No Restaurant found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: restaurant,
  });
});

exports.deleteRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.storeId);

  if (!restaurant)
    return next(new ErrorHandler("No document found with that ID", 404));

  res.status(204).json({
    status: "success",
  });
});
