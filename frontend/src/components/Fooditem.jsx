import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIndianRupeeSign } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  addItemToCart,
  updateCartQuantity,
  removeItemFromCart,
} from "../redux/actions/cartActions";
import axios from "axios";
import { getMenus } from "../redux/actions/menuActions";

const Fooditem = ({ fooditem, restaurant }) => {
  const [quantity, setQuantity] = useState(1);
  const [showButtons, setShowButtons] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionError, setNutritionError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  //state (Redux Toolkit user slice)
  const { user } = useSelector((state) => state.user);
  const isAuthenticated = !!user;

  //cart from slice
  const { cartItems } = useSelector((state) => state.cart);

  useEffect(() => {
    const cartItem = cartItems.find(
      (item) => item.foodItem._id === fooditem._id
    );

    if (cartItem) {
      setQuantity(cartItem.quantity);
      setShowButtons(true);
    } else {
      setQuantity(1);
      setShowButtons(false);
    }
  }, [cartItems, fooditem]);

  // ➖ decrease
  const decreaseQty = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);

      //params
      dispatch(updateCartQuantity(fooditem._id, newQuantity));
    } else {
      setQuantity(0);
      setShowButtons(false);
      dispatch(removeItemFromCart(fooditem._id));
    }
  };

  // ➕ increase
  const increaseQty = () => {
    if (quantity < fooditem.stock) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);

      dispatch(updateCartQuantity(fooditem._id, newQuantity));
    } else {
      alert("Exceeded stock limit");
    }
  };

  //add to cart
  const addToCartHandler = () => {
    if (!isAuthenticated) {
      return navigate("/users/login");
    }

    const restId =
      restaurant ||
      (typeof fooditem.restaurant === "object"
        ? fooditem.restaurant?._id
        : fooditem.restaurant);

    dispatch(addItemToCart(fooditem._id, restId, quantity));
    setShowButtons(true);
  };

  const getNutritionLevelDetails = (level) => {
    const normalized = (level || "Moderate").toString().trim();

    if (normalized.toLowerCase() === "healthy choice") {
      return {
        label: "Healthy Choice",
        icon: "🟢",
        accent: "#16a34a",
        description: "Light, balanced meals",
      };
    }

    if (normalized.toLowerCase() === "indulgent") {
      return {
        label: "Indulgent",
        icon: "🟠",
        accent: "#f97316",
        description: "High calories or fat",
      };
    }

    if (normalized.toLowerCase() === "treat") {
      return {
        label: "Treat",
        icon: "🔴",
        accent: "#dc2626",
        description: "Desserts or sugary drinks",
      };
    }

    return {
      label: "Moderate",
      icon: "🟡",
      accent: "#f59e0b",
      description: "Regular meals",
    };
  };

  

  const analyzeNutritionHandler = async () => {
    setNutritionError("");
    setNutritionData(null);

    const calories = fooditem.calories;
    const protein = fooditem.protein;
    const carbs = fooditem.carbs;
    const fat = fooditem.fat;

    if (
      calories === undefined ||
      protein === undefined ||
      carbs === undefined ||
      fat === undefined
    ) {
      setNutritionError("Nutrition values are not available for this item.");
      setShowNutritionModal(true);
      return;
    }

    setNutritionLoading(true);

    try {
      const { data } = await axios.post("/api/v1/ai/nutrition", {
        name: fooditem.name,
        calories,
        protein,
        carbs,
        fat,
      });

      setNutritionData(data.data);
      setShowNutritionModal(true);
    } catch (err) {
      setNutritionError(
        err.response?.data?.message || "Unable to generate nutrition analysis"
      );
      setShowNutritionModal(true);
    } finally {
      setNutritionLoading(false);
    }
  };

  return (
    <div className="col-sm-12 col-md-6 col-lg-3 my-3">
      <div className="card p-3 rounded">
        <img
          className="card-img-top mx-auto food-image"
          src={fooditem.images?.[0]?.url || "/images/placeholder.png"}
          alt={fooditem.name}
        />

        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{fooditem.name}</h5>

          {fooditem.restaurant && typeof fooditem.restaurant === "object" && fooditem.restaurant.name && (
            <p className="text-muted small mb-1">
              <i className="fa fa-cutlery text-success mr-1" aria-hidden="true"></i>
              <strong>{fooditem.restaurant.name}</strong>
            </p>
          )}

          <p className="fooditem_des">{fooditem.description}</p>

          <p className="card-text">
            <FontAwesomeIcon icon={faIndianRupeeSign} size="xs" />
            {fooditem.price}
          </p>

          {!showButtons ? (
          
            (!isAuthenticated || user?.role !== "admin") && (
              <button
              id="cart_btn"
              className="btn btn-primary ml-4"
              disabled={fooditem.stock === 0}
              onClick={addToCartHandler}
            >
              Add to Cart
            </button>
            )
          ) : (
            <div className="stockCounter d-inline">
              <span className="btn btn-danger minus" onClick={decreaseQty}>
                -
              </span>

              <input
                type="number"
                className="form-control count d-inline"
                value={quantity}
                readOnly
              />

              <span className="btn btn-primary plus" onClick={increaseQty}>
                +
              </span>
            </div>
          )}

          <button
            type="button"
            className="btn btn-outline-success mt-3 nutrition-btn"
            onClick={analyzeNutritionHandler}
          >
            ✨ Quick Nutrition
          </button>

          <hr />

          <p>
            Status:
            <span
              className={
                fooditem.stock > 0 ? "greenColor" : "redColor"
              }
            >
              {fooditem.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </p>

          {/* ADMIN DELETE */}
          {isAuthenticated && user?.role === "admin" && (
            <button
              className="btn btn-danger btn-sm mt-2"
              onClick={async () => {
                if (!window.confirm("Delete this food item?")) return;

                try {
                  await axios.delete(`/api/v1/eats/item/${fooditem._id}`, {
                    withCredentials: true,
                  });

                  if (restaurant) {
                    dispatch(getMenus(restaurant));
                  }
                } catch (err) {
                  console.error(err);
                  alert(
                    err.response?.data?.message || "Unable to delete item"
                  );
                }
              }}
            >
              Delete
            </button>
          )} 
        </div>
      </div>

      {showNutritionModal && (
        <div className="nutrition-modal-overlay">
          <div className="nutrition-modal">
            <div className="nutrition-modal-header">
              <h5>Nutrition Insights</h5>
              <button
                className="btn-close"
                onClick={() => {
                  setShowNutritionModal(false);
                  setNutritionData(null);
                  setNutritionError("");
                }}
              />
            </div>

            {nutritionLoading ? (
              <div className="nutrition-modal-body">Loading...</div>
            ) : nutritionError ? (
              <div className="nutrition-modal-body text-danger">
                {nutritionError}
              </div>
            ) : nutritionData ? (
              <div className="nutrition-modal-body">
                <div className="nutrition-hero">
                  <span className="nutrition-pill">✨ Smart insight</span>
                  <h4>{fooditem.name}</h4>
                </div>

                {(() => {
                  const levelDetails = getNutritionLevelDetails(
                    nutritionData.nutritionLevel || nutritionData.level || nutritionData.healthScore
                  );

                  return (
                    <div className="nutrition-section nutrition-score-card">
                      <strong>Nutrition Level</strong>
                      <div className="nutrition-score-row">
                        <span
                          className="nutrition-score-label"
                          style={{ color: levelDetails.accent, fontWeight: 700 }}
                        >
                          {levelDetails.icon} {levelDetails.label}
                        </span>
                      </div>
                      <p className="nutrition-summary" style={{ marginTop: "0.4rem" }}>
                        {levelDetails.description}
                      </p>
                    </div>
                  );
                })()}

                <div className="nutrition-grid">
                  <div className="nutrition-card">
                    <strong>Calories</strong>
                    <p>{fooditem.calories || "N/A"} kcal</p>
                  </div>
                  <div className="nutrition-card">
                    <strong>Protein</strong>
                    <p>{fooditem.protein || "N/A"} g</p>
                  </div>
                  <div className="nutrition-card">
                    <strong>Carbs</strong>
                    <p>{fooditem.carbs || "N/A"} g</p>
                  </div>
                  <div className="nutrition-card">
                    <strong>Fat</strong>
                    <p>{fooditem.fat || "N/A"} g</p>
                  </div>
                </div>

                <div className="nutrition-section">
  <strong>💡 AI Insight</strong>
  <p className="nutrition-summary">
    {nutritionData.insight}
  </p>
</div>
              </div>
            ) : (
              <div className="nutrition-modal-body">No analysis data available.</div>
            )}

            <div className="nutrition-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowNutritionModal(false);
                  setNutritionData(null);
                  setNutritionError("");
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fooditem;