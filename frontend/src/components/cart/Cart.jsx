import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCartItems,
  removeItemFromCart,
  updateCartQuantity,
} from "../../redux/actions/cartActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIndianRupee } from "@fortawesome/free-solid-svg-icons";
import { payment } from "../../redux/actions/orderActions";
import { toast } from "react-toastify"; 

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, restaurant } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  const removeCartItemHandler = (id) => {
    dispatch(removeItemFromCart(id));
    toast.success("Item removed from cart"); 
  };

  const increaseQty = (id, quantity, stock) => {
    const newQty = quantity + 1;
    if (newQty > stock) {
      toast.error("Exceeded stock limit");
      return;
    }
    dispatch(updateCartQuantity(id, newQty));
  };

  const decreaseQty = (id, quantity) => {
    if (quantity > 1) {
      const newQty = quantity - 1;
      dispatch(updateCartQuantity(id, newQty));
    } else {
      toast.error("Minimum quantity reached"); 
    }
  };

  const checkoutHandler = () => {
    dispatch(payment(cartItems, restaurant));
    // // navigate("/delivery");
  };

  return (
    <>
      {cartItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🛒</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: "var(--text-primary)", fontSize: "1.75rem" }}>
            Your Cart is Empty
          </h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Looks like you haven't added anything yet.
          </p>
        </div>
      ) : (
        <>
          <div style={{ padding: "1.5rem 0 0.5rem" }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: "var(--text-primary)", fontSize: "1.6rem" }}>
              🛒 Your Cart <span style={{ color: "var(--primary)", fontSize: "1.2rem", fontWeight: 600 }}>({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              📍 Restaurant: <strong style={{ color: "var(--text-secondary)" }}>{restaurant.name}</strong>
            </p>
          </div>

          <div className="row d-flex justify-content-between cartt">

            <div className="col-12 col-lg-8">
              {cartItems.map((item) => (
                <div className="cart-item" key={item._id}>
                  <div className="row">
                    <div className="col-4 col-lg-3">
                      <img
                        src={item.foodItem.images[0].url}
                        alt="items"
                        height="90"
                        width="115"
                      />
                    </div>

                    <div className="col-5 col-lg-3">
                      {item.foodItem.name}
                    </div>

                    <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                      <p id="card_item_price">
                        <FontAwesomeIcon icon={faIndianRupee} size="xs" />
                        {item.foodItem.price}
                      </p>
                    </div>

                    <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                      <div className="stockCounter d-inline">
                        <span
                          className="btn btn-danger minus"
                          onClick={() =>
                            decreaseQty(item.foodItem._id, item.quantity)
                          }
                        >
                          -
                        </span>

                        <input
                          type="number"
                          className="form-control count d-inline"
                          value={item.quantity}
                          readOnly
                        />

                        <span
                          className="btn btn-primary plus"
                          onClick={() =>
                            increaseQty(
                              item.foodItem._id,
                              item.quantity,
                              item.foodItem.stock
                            )
                          }
                        >
                          +
                        </span>
                      </div>
                    </div>

                    <div className="col-4 col-lg-1 mt-4 mt-lg-0">
                      <i
                        id="delete_cart_item"
                        className="fa fa-trash btn btn-danger"
                        onClick={() =>
                          removeCartItemHandler(item.foodItem._id)
                        }
                      ></i>
                    </div>
                  </div>
                  <hr />
                </div>
              ))}
            </div>

            <div className="col-12 col-lg-3 my-4">
              <div id="order_summary">
                <h4>Order Summary</h4>
                <hr />

                <p>
                  Subtotal:
                  <span className="order-summary-values">
                    {cartItems.reduce(
                      (acc, item) => acc + Number(item.quantity),
                      0
                    )}
                    (Units)
                  </span>
                </p>

                <p>
                  Total:
                  <span className="order-summary-values">
                    <FontAwesomeIcon icon={faIndianRupee} size="xs" />
                    {cartItems
                      .reduce(
                        (acc, item) =>
                          acc + item.quantity * item.foodItem.price,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </p>

                <hr />

                <button
                  id="checkout_btn"
                  className="btn btn-primary btn-block"
                  onClick={checkoutHandler}
                >
                  Check Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Cart;