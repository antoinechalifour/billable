import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCalendarSizes } from "@/src/hooks/useCalendarSizes";
import { getCalendarRows } from "@/src/domain/calendar";
import { MONTHS } from "@/src/domain/months";
import React from "react";

const getMonthData = (
  paramYear: number,
  paramMonth: number,
  monthOffset: number,
) => {
  const baseDate = new Date(paramYear, paramMonth + monthOffset, 1);
  return {
    month: baseDate.getMonth(),
    year: baseDate.getFullYear(),
  };
};
export const MonthCalendar = ({
  currentDate,
  paramYear,
  paramMonth,
  monthOffset,
}: {
  currentDate: Date;
  paramYear: number;
  paramMonth: number;
  monthOffset: number;
}) => {
  const sizes = useCalendarSizes();
  // When monthOffset is 0, just use the passed month/year directly
  const month =
    monthOffset === 0
      ? paramMonth
      : getMonthData(paramYear, paramMonth, monthOffset).month;
  const year =
    monthOffset === 0
      ? paramYear
      : getMonthData(paramYear, paramMonth, monthOffset).year;
  const rows = getCalendarRows(month, year);

  const renderCalendarDay = (
    day: number | null,
    index: number,
    month: number,
    year: number,
  ) => {
    const isToday =
      day &&
      day === currentDate.getDate() &&
      month === currentDate.getMonth() &&
      year === currentDate.getFullYear();

    return (
      <TouchableOpacity
        key={index}
        style={[
          monthStyles.dayCell,
          isToday ? monthStyles.todayCell : undefined,
          sizes.cell,
        ]}
        disabled={!day}
      >
        <Text
          style={[
            monthStyles.dayText,
            isToday ? monthStyles.todayText : undefined,
          ]}
        >
          {day || ""}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[monthStyles.monthContainer, sizes.month]}>
      <View style={monthStyles.monthHeader}>
        <Text style={monthStyles.monthHeaderText}>
          {MONTHS[month]} {year}
        </Text>
      </View>

      <View>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={monthStyles.calendarRow}>
            {row.map((day, dayIndex) =>
              renderCalendarDay(day, rowIndex * 7 + dayIndex, month, year),
            )}
          </View>
        ))}
      </View>
    </View>
  );
};
const monthStyles = StyleSheet.create({
  monthContainer: {
    marginBottom: 24,
  },
  monthHeader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  monthHeaderText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
  },
  calendarRow: {
    flexDirection: "row",
  },
  dayCell: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    padding: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E5EA",
  },
  dayText: {
    fontSize: 16,
    color: "#000",
  },
  todayCell: {
    backgroundColor: "#007AFF10",
    borderTopColor: "#007AFF",
    borderTopWidth: 1,
  },
  todayText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
