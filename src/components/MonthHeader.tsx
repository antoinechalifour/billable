import { StyleSheet, Text, View } from "react-native";
import { MONTHS } from "@/src/domain/months";
import React from "react";
import { ISOMonth } from "@/src/domain/ISOMonth";

export function MonthHeader({ isoMonth }: { isoMonth: ISOMonth }) {
  const [, month] = isoMonth.split("-").map(Number);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{MONTHS[month]}</Text>
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
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
  },
});
