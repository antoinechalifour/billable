import { View, Text, StyleSheet } from "react-native";

export default function ClientsScreen() {
  return (
    <View style={styles.container}>
      <Text>Clients Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
