"use client";

import { useState } from "react";
import { AlarmList } from "@/components/adminPage/alarms/alarm-list";
import { AlarmDetail } from "@/components/adminPage/alarms/alarm-detail";

export default function Alarms() {
  const [selectedAlarm, setSelectedAlarm] = useState(null);

  return (
    <div className="min-h-screen ">
      {selectedAlarm ? (
        <AlarmDetail
          alarmId={selectedAlarm}
          onBack={() => setSelectedAlarm(null)}
        />
      ) : (
        <AlarmList onSelectAlarm={setSelectedAlarm} />
      )}
    </div>
  );
}
