import React, { useState } from "react";
import login from "../../assets/images/imagesAuth/login.png";
import logo from "../../assets/images/imagesHeader/logo.svg";
import logo2 from "../../assets/images/imagesAuth/logo2.svg";
import authApi from "../../api/authApi";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../redux/auth/authSlice";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await authApi.login({ username: email, password });
      const token = res.data.access_token;

      localStorage.setItem("access_token", token);

      const decoded = jwtDecode(token);

      dispatch(setUser(decoded));

      alert("Đăng nhập thành công!");

      if (decoded.roles?.includes("admin")) {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      alert("Sai email hoặc mật khẩu!");
    }
  };

  return (
    <div
      className="w-screen h-screen flex"
      style={{ backgroundImage: `url(${login})` }}
    >
      <h1></h1>
      <div className="w-[40vw] h-screen relative flex justify-end">
        <img className="h-10 absolute left-3 top-3" src={logo} alt="" />
        <div className="ml-25 flex flex-col gap-5 justify-center">
          <p className="relative">
            Real-time GNSS interference detection/classification/localization.
            <img
              className="absolute h-10 w-40 -left-10 -top-6"
              src={logo2}
              alt=""
            />
          </p>
          <p>
            {" "}
            Application for anomaly detection in raw GNSS observations. Supports
            RTCM, NMEA, SBF data formats.
          </p>
          <p>
            Access to the service is limited to invitation-only at this stage.
          </p>
        </div>
      </div>

      <div className="w-[15vw] h-screen  bg-gradient-to-r from-transparent via-black/60 to-black"></div>
      {/* Form đăng nhập */}
      <div className="w-[45vw] h-screen bg-black flex flex-col justify-center">
        <h1 className="text-3xl font-light">LOGIN</h1>
        <form onSubmit={handleLogin} className="flex flex-col">
          <label className="text-[#8e8e8e] mt-5" htmlFor="emailSignin">
            E-MAIL
          </label>
          <input
            id="emailSignin"
            type="email"
            value={email}
            placeholder="Enter e-mail"
            className="bg-[#333333] p-3 round-lg mr-30 text-lg"
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="text-[#8e8e8e] mt-5" htmlFor="passwordSignin">
            PASSWORD
          </label>
          <input
            id="passwordSignin"
            type="password"
            placeholder="Enter password"
            value={password}
            className="bg-[#333333] p-3 round-lg mr-30 text-lg"
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex gap-47">
            <p className="mt-5 text-sm text-gray-400">
              Chưa có tài khoản?{" "}
              <span
                className="text-[#03de8c] cursor-pointer"
                onClick={() => navigate("/signup")}
              >
                Đăng ký
              </span>
            </p>
            <button
              type="submit"
              className="px-[9px] py-[15px] bg-[#03de8c] w-[200px] mt-5 rounded-lg"
            >
              LOGIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signin;
