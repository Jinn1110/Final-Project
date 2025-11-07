import React from "react";
import Button from "./Button";

const MainContent = () => {
  return (
    <main className="pt-[80px] flex flex-col justify-center items-center">
      <h1 className="text-4xl font-medium mt-[90px]">GP-Cloud</h1>
      <h2 className="mt-[12px] text-xl font-normal">
        Web app for true real-time GNSS signal quality analysis, interference
        detection and classification
      </h2>
      <p className="text-sm mt-[25px] font-light">
        Advanced GNSS spoofing/jamming detection, localization and logging
      </p>

      <Button className="px-12 py-3 font-normal text-xl mt-[50px]">
        How to buy
      </Button>
    </main>
  );
};

export default MainContent;
