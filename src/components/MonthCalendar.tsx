import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCalendarSizes } from "@/src/hooks/useCalendarSizes";
import { getCalendarRows } from "@/src/domain/calendar";
import { MONTHS } from "@/src/domain/months";
import React from "react";
import * as Haptics from "expo-haptics";
import { ISOMonth, parseIsoMonth } from "@/src/domain/ISOMonth";
import { useCurrentDate } from "@/src/hooks/useCurrentDate";

export type ISODate = `${ISOMonth}-${number}`;
export const MonthCalendar = ({
  isoMonth,
  onDayPress,
}: {
  isoMonth: ISOMonth;
  onDayPress(isoDate: ISODate): void;
}) => {
  const currentDate = useCurrentDate();
  const sizes = useCalendarSizes();
  const { month, year } = parseIsoMonth(isoMonth);
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
          styles.dayCell,
          isToday ? styles.todayCell : undefined,
          sizes.cell,
        ]}
        disabled={!day}
        onPress={() => {
          if (day == null) return;
          Haptics.selectionAsync();
          onDayPress(`${year}-${month + 1}-${day}`);
        }}
      >
        <Text style={[styles.dayText, isToday ? styles.todayText : undefined]}>
          {day || ""}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[sizes.month]}>
      <View style={styles.monthHeader}>
        <Text style={styles.monthHeaderText}>
          {MONTHS[month]} {year}
        </Text>
      </View>

      <View>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.calendarRow}>
            {row.map((day, dayIndex) =>
              renderCalendarDay(day, rowIndex * 7 + dayIndex, month, year),
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  monthHeader: {
    paddingVertical: 8,
    alignItems: "flex-end",
  },
  monthHeaderText: {
    fontSize: 12,
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
