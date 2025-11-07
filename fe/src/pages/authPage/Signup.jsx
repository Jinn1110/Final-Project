import React, { useState } from "react";
import login from "../../assets/images/imagesAuth/login.png";
import logo from "../../assets/images/imagesHeader/logo.svg";
import logo2 from "../../assets/images/imagesAuth/logo2.svg";
import authApi from "../../api/authApi";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }

    try {
      const res = await authApi.register({ email, password, name });
      console.log("Đăng ký thành công:", res.data);
      alert("Đăng ký thành công! Hãy đăng nhập để tiếp tục.");
      navigate("/signin");
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      alert("Email đã tồn tại hoặc dữ liệu không hợp lệ!");
    }
  };

  return (
    <div
      className="w-screen h-screen flex"
      style={{ backgroundImage: `url(${login})` }}
    >
      {/* Bên trái: mô tả */}
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
            Application for anomaly detection in raw GNSS observations. Supports
            RTCM, NMEA, SBF data formats.
          </p>
          <p>
            Access to the service is limited to invitation-only at this stage.
          </p>
        </div>
      </div>

      {/* Lớp chuyển màu */}
      <div className="w-[15vw] h-screen bg-gradient-to-r from-transparent via-black/60 to-black"></div>

      {/* Form đăng ký */}
      <div className="w-[45vw] h-screen bg-black flex flex-col justify-center">
        <h1 className="text-3xl font-light">SIGN UP</h1>
        <form onSubmit={handleSignup} className="flex flex-col">
          <label className="text-[#8e8e8e] mt-5" htmlFor="emailSignup">
            E-MAIL
          </label>
          <input
            id="emailSignup"
            type="email"
            value={email}
            placeholder="Enter e-mail"
            className="bg-[#333333] p-3 rounded-lg text-lg mr-30"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="text-[#8e8e8e] mt-5" htmlFor="yourname">
            YOUR NAME
          </label>
          <input
            id="yourname"
            type="text"
            value={name}
            placeholder="Enter your name"
            className="bg-[#333333] p-3 rounded-lg text-lg mr-30"
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="text-[#8e8e8e] mt-5" htmlFor="passwordSignup">
            PASSWORD
          </label>
          <input
            id="passwordSignup"
            type="password"
            value={password}
            placeholder="Enter password"
            className="bg-[#333333] p-3 rounded-lg text-lg mr-30"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="text-[#8e8e8e] mt-5" htmlFor="confirmSignup">
            CONFIRM PASSWORD
          </label>
          <input
            id="confirmSignup"
            type="password"
            value={confirmPassword}
            placeholder="Re-enter password"
            className="bg-[#333333] p-3 rounded-lg text-lg mr-30"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="flex gap-47">
            <p className="mt-5 text-sm text-gray-400">
              Đã có tài khoản?{" "}
              <span
                className="text-[#03de8c] cursor-pointer"
                onClick={() => navigate("/signin")}
              >
                Đăng nhập
              </span>
            </p>
            <button
              type="submit"
              className="px-[9px] py-[15px] bg-[#03de8c] w-[200px] mt-5 rounded-lg"
            >
              REGISTER
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
