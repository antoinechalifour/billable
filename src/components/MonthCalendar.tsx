import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getCalendarSize } from "@/src/hooks/getCalendarSize";
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
  const sizes = getCalendarSize(isoMonth);
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
      <View style={[styles.monthHeader]}>
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
    alignItems: "flex-end",
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderColor: "#E5E5EA",
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
    alignItems: "center",
  },
  dayText: {
    fontSize: 16,
    color: "#000",
  },
  todayCell: {},
  todayText: {
    color: "#062fb6",
    fontWeight: "600",
    backgroundColor: "#d0e2ff",
    padding: 8,
    marginTop: -8,
    borderRadius: 50,
  },
});
