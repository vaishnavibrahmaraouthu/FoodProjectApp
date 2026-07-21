const Restaurant = require("../models/restaurant");
const Fooditem = require("../models/foodItem");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");

exports.getAllRestaurants = catchAsync(async (req, res, next) => {
  const { keyword, cuisine, sortBy } = req.query;

  let queryConditions = [];
  let matchingFoodItemsWithRest = [];

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

    // Find food items matching keyword and populate restaurant details
    matchingFoodItemsWithRest = await Fooditem.find({
      $or: [
        { name: simpleRegex },
        { name: regexQuery },
        { description: simpleRegex },
      ],
    }).populate("restaurant");

    const restaurantIdsFromFood = matchingFoodItemsWithRest
      .map((item) => item.restaurant?._id || item.restaurant)
      .filter(Boolean);

    queryConditions.push({
      $or: [
        { name: simpleRegex },
        { name: regexQuery },
        { address: simpleRegex },
        { _id: { $in: restaurantIdsFromFood } },
      ],
    });
  }

  const findQuery =
    queryConditions.length > 0 ? { $and: queryConditions } : {};

  let query = Restaurant.find(findQuery);

  if (sortBy === "ratings") {
    query = query.sort({ ratings: -1 });
  } else if (sortBy === "reviews") {
    query = query.sort({ numOfReviews: -1 });
  }

  const restaurants = await query;

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
