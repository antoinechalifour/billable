import { StyleSheet, Text, View } from "react-native";
import { MONTHS } from "@/src/domain/months";
import React from "react";

export type ISOMonth = `${number}-${number}`;

export function MonthHeader({ isoMonth }: { isoMonth: ISOMonth }) {
  const [year, month] = isoMonth.split("-").map(Number);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {MONTHS[month]} {year}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000",
  },
});
