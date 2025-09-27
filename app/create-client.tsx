import React from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";

export default function CreateClientScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hello world</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#f2f2f7",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
    marginLeft: 4,
  },
});
