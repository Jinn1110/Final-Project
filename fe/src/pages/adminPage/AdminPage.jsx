import React, { useState } from "react";
import SideBar from "../../components/adminPage/SideBar";
import Map from "../../components/adminPage/Map";
import DashBoard from "../../components/adminPage/DashBoard";
import Charts from "../../components/adminPage/Charts";
import Probes from "../../components/adminPage/Probes";
import Alarms from "../../components/adminPage/Alarms";
import Profile from "../../components/adminPage/Profile";
import Settings from "../../components/adminPage/Settings";

const AdminPage = () => {
  const [activeComponent, setActiveComponent] = useState("DASHBOARD");
  console.log(activeComponent);

  const renderComponent = () => {
    switch (activeComponent) {
      case "DASHBOARD":
        return <DashBoard />;
      case "MAP":
        return <Map />;
      case "CHARTS":
        return <Charts />;
      case "PROBES":
        return <Probes />;
      case "ALARMS":
        return <Alarms />;
      case "PROFILE":
        return <Profile />;
      case "SETTINGS":
        return <Settings />;
      default:
        return <Map />;
    }
  };
  return (
    <div className="bg-[#242424] flex">
      <SideBar
        onMenuSelect={setActiveComponent}
        activeComponent={activeComponent}
      />
      <div className="ml-54 min-h-screen w-full text-white">
        {renderComponent()}
      </div>
    </div>
  );
};

export default AdminPage;
