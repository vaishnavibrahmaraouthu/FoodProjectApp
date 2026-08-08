import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../layout/Loader";

import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/actions/userActions";
import { clearErrors } from "../../redux/slices/userSlice";

import { toast } from "react-toastify";

const DEFAULT_AVATAR = "/images/avatar4.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.user,
  );

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Login successful");
      navigate("/");
    }

    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, isAuthenticated, error, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="row wrapper">
          <div className="col-10 col-lg-5">
            <form className="shadow-lg" onSubmit={submitHandler}>
              <div className="text-center mb-3">
                <img
                  src={DEFAULT_AVATAR}
                  alt="Login avatar"
                  className="rounded-circle"
                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
              </div>
              <h1 className="mb-3">Login</h1>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div  className="text-end mb-3">
              <Link to="/users/forgetPassword" className="float-right mb-4">
                Forgot Password
              </Link>
              </div>

              <button className="btn btn-block py-3">LOGIN</button>

              <div className="text-end mt-3">
              <Link to="/users/signup" className="float-right mt-3">
                NEW USER?
              </Link>
              </div>
              
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
