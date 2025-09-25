import { StyleSheet, Text, View } from "react-native";
import { useCalendarSizes } from "@/src/hooks/useCalendarSizes";
import { DAYS } from "@/src/domain/days";
import React from "react";

export const DaysHeader = () => {
  const sizes = useCalendarSizes();

  return (
    <View style={styles.container}>
      {DAYS.map((day) => (
        <View key={day} style={[styles.cell, { width: sizes.cell.width }]}>
          <Text style={styles.text}>{day}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#F2F2F7",
    zIndex: 1,
  },
  cell: {
    alignItems: "center",
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8E8E93",
  },
});
