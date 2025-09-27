import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCurrentDate } from "@/src/hooks/useCurrentDate";
import { CalendarList } from "@/src/components/CalendarList";
import { z } from "zod";

const useCalendarScreenParams = () => {
  const currentDate = useCurrentDate();
  const params = useLocalSearchParams();

  return z
    .object({
      month: z
        .string()
        .optional()
        .transform((value) => {
          if (!value) return currentDate.getMonth();
          return parseInt(value);
        }),
      year: z
        .string()
        .optional()
        .transform((value) => {
          if (!value) return currentDate.getFullYear();
          return parseInt(value);
        }),
    })
    .parse(params);
};

export default function CalendarScreen() {
  const router = useRouter();
  const { month, year } = useCalendarScreenParams();

  return (
    <CalendarList
      initialIsoMonth={`${year}-${month}`}
      onDayPressed={(isoDate) => router.push("/test")}
    />
  );
}
