import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCurrentDate } from "@/src/hooks/useCurrentDate";
import { CalendarList } from "@/src/components/CalendarList";

export default function CalendarScreen() {
  const router = useRouter();
  const params2 = useLocalSearchParams();
  const currentDate = useCurrentDate();
  const [{ paramYear, paramMonth }, setParams] = useState(() => {
    const paramMonth = params2.month
      ? parseInt(params2.month as string)
      : currentDate.getMonth();
    const paramYear = params2.year
      ? parseInt(params2.year as string)
      : currentDate.getFullYear();
    return { paramMonth, paramYear };
  });

  return (
    <CalendarList
      initialIsoMonth={`${paramYear}-${paramMonth}`}
      onDayPressed={(isoDate) => router.push("//test")}
    />
  );
}
