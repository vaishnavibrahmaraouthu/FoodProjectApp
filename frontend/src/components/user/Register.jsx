import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register} from "../../redux/actions/userActions";
import { clearErrors } from "../../redux/slices/userSlice";

const AVATAR_OPTIONS = [
  "/images/avatar1.jpg",
  "/images/avatar2.jpg",
  "/images/avatar3.jpg",
  "/images/avatar4.jpg",
  "/images/avatar5.jpg",
  "/images/avatar6.jpg",
  "/images/avatar7.jpg",
  "/images/avatar8.jpg",
  "/images/avatar9.jpg",
  "/images/avatar10.jpg"
];
const DEFAULT_AVATAR = AVATAR_OPTIONS[0];

const Register = () => {
 
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phoneNumber: "",
  });

  const { name, email, password, passwordConfirm, phoneNumber } = user;

  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, error, loading } = useSelector(
    (state) => state.user
  );

  //useEffect to handle redirection and error alerts
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
    if (error) {
      window.alert(error);
      dispatch(clearErrors());
    }
  }, [dispatch, isAuthenticated, error, navigate]);

  const submitHandler = (e) => {
  e.preventDefault();

  if (password !== passwordConfirm) {
    alert("Passwords do not match");
    return;
  }

  const userData = {
    name,
    email,
    password,
    passwordConfirm,
    phoneNumber,
    avatar: avatar || DEFAULT_AVATAR,
  };

  dispatch(register(userData)); 
};

  const onChange = (e) => {
    if (e.target.name === "avatar") {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };

  const chooseAvatar = (url) => {
    setAvatar(url);
    setAvatarPreview(url);
  };

  return (
    <>
      <div className="row wrapper">
        <div className="col-10 col-lg-5 registration-form">
          <form
            className="shadow-lg"
            onSubmit={submitHandler}
            encType="multipart/form-data"
          >
            <h1 className="mb-3">Register</h1>
            <div className="form-group">
              <label htmlFor="name_field">Name</label>
              <input
                type="text"
                id="name_field"
                className="form-control"
                name="name"
                value={name}
                onChange={onChange}
              ></input>
            </div>
            <div className="form-group">
              <label htmlFor="email_field">Email</label>
              <input
                type="email"
                id="email_field"
                className="form-control"
                name="email"
                value={email}
                onChange={onChange}
              ></input>
            </div>
            <div className="form-group">
              <label htmlFor="password_field">Password</label>
              <input
                type="password"
                id="password_field"
                className="form-control"
                name="password"
                value={password}
                onChange={onChange}
              ></input>
            </div>
            <div className="form-group">
              <label htmlFor="passwordConfirm_field">Password Confirm</label>
              <input
                type="password"
                id="passwordConfirm_field"
                className="form-control"
                name="passwordConfirm"
                value={passwordConfirm}
                onChange={onChange}
              ></input>
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber_field">Phone Number</label>
              <input
                type="number"
                id="phoneNumber_field"
                className="form-control"
                name="phoneNumber"
                value={phoneNumber}
                onChange={onChange}
              ></input>
            </div>
            <div className="form-group">
              <label htmlFor="avatar_upload">Avatar</label>
              <div className="avatar-options mb-3">
                {AVATAR_OPTIONS.map((url) => (
                  <button
                    type="button"
                    key={url}
                    className={`avatar-option ${avatar === url ? "selected" : ""}`}
                    onClick={() => chooseAvatar(url)}
                  >
                    <img
                      src={url}
                      alt="Avatar choice"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_AVATAR;
                      }}
                    />
                  </button>
                ))}
              </div>
              <div className="d-flex align-items-center">
                <div>
                  <figure className="avatar mr-3 item-rtl">
                    <img
                      src={avatarPreview}
                      className="rounded-circle"
                      alt="Avatar Preview"
                      onError={() => setAvatarPreview(DEFAULT_AVATAR)}
                    />
                  </figure>
                </div>
                <div className="custom-file">
                  <input
                    type="file"
                    name="avatar"
                    className="custom-file-input"
                    id="customFile"
                    accept="images/*"
                    onChange={onChange}
                  ></input>
                  <label className="custom-file-label" htmlFor="customFile">
                    Upload Avatar
                  </label>
                </div>
              </div>
            </div>

            <button
              id="register_button"
              type="submit"
              className="btn btn-block py-3"
              disabled={loading ? true : false}
            >
              REGISTER
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
