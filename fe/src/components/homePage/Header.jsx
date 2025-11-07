import React from "react";
import menu from "../../assets/images/imagesHeader/menu.svg";
import search from "../../assets/images/imagesHeader/search.svg";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/signin");
  };
  return (
    <header className="fixed top-0 left-0 flex justify-between items-center w-full px-10 h-[80px] shadow-[0_1px_0_rgba(255,255,255,0.3)] bg-black">
      <div className="w-[20%]">
        <img
          className="h-10"
          src="https://gpspatron.com/wp-content/uploads/2017/07/Logo.svg"
          alt=""
        />
      </div>

      <div className="w-[30%]">
        <ul className="flex justify-between font-light">
          <li>Products</li>
          <li>Resource center</li>
          <li>
            <img className="w-8" src={menu} alt="" />
          </li>
        </ul>
      </div>

      <div
        onClick={handleClick}
        className="flex justify-center items-center gap-4 w-[20%]"
      >
        <img className="h-8 cursor-pointer" src={search} alt="" />
        <Button>GP-Clould App</Button>
      </div>
    </header>
  );
};

export default Header;
