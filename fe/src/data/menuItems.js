// src/data/menuItems.js

import dashboardIcon from "../assets/images/imagesAdminPage/dashboard.svg";
import mapIcon from "../assets/images/imagesAdminPage/map.svg";
import chartsIcon from "../assets/images/imagesAdminPage/charts.svg";
import probesIcon from "../assets/images/imagesAdminPage/probes.svg";
import alarmsIcon from "../assets/images/imagesAdminPage/alarms.svg";
import profileIcon from "../assets/images/imagesAdminPage/profile.svg";
import settingsIcon from "../assets/images/imagesAdminPage/settings.svg";
import logoutIcon from "../assets/images/imagesAdminPage/logout.svg";

// Main navigation
export const mainMenuItems = [
  { name: "DASHBOARD", icon: dashboardIcon },
  { name: "MAP", icon: mapIcon },
  { name: "CHARTS", icon: chartsIcon },
  { name: "PROBES", icon: probesIcon },
  { name: "ALARMS", icon: alarmsIcon },
];

// User / account menu
export const userMenuItems = [
  { name: "PROFILE", icon: profileIcon },
  { name: "SETTINGS", icon: settingsIcon },
  { name: "LOG OUT", icon: logoutIcon },
];
