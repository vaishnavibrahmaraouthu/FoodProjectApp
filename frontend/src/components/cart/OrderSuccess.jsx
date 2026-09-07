import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "../../redux/actions/orderActions";
import { clearErrors } from "../../redux/slices/orderSlice";
import { toast } from "react-toastify";

const OrderSuccess = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const hasCalled = useRef(false); //prevent double call

  const { error, order } = useSelector((state) => state.order);

  const searchParams = new URLSearchParams(location.search);
  const session_id = searchParams.get("session_id");

  useEffect(() => {
    if (!session_id || hasCalled.current) return;

    hasCalled.current = true;

    dispatch(createOrder(session_id));
  }, [dispatch, session_id]);

  useEffect(() => {
    if (order) {
      toast.success("Order placed successfully 🎉", {
        position: "bottom-right",
      });
    }

    if (error) {
      toast.error(error, { position: "bottom-right" });
      dispatch(clearErrors());
    }
  }, [order, error, dispatch]);

  return (
    <div className="order-success-wrapper">
      <div className="order-success-box">
        <svg
          className="checkmark"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 52 52"
        >
          <circle
            className="checkmark__circle"
            cx="26"
            cy="26"
            r="25"
            fill="none"
          />
          <path
            className="checkmark__check"
            fill="none"
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
          />
        </svg>

        <h2>🎉 Order Placed Successfully!</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          Your delicious food is being prepared. Sit tight!
        </p>

        <Link to="/eats/orders/me/myOrders">View My Orders →</Link>
      </div>
    </div>
  );
};

export default OrderSuccess;