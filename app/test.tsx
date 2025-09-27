import { StyleSheet, TextInput, View } from "react-native";

export default function TestPage() {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Nom du client" />
        <View style={styles.divider} />
        <TextInput style={styles.input} placeholder="Tarif" />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          numberOfLines={4}
          multiline
          style={styles.input}
          placeholder="Notes"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    minHeight: 300,
    gap: 32,
  },
  inputContainer: {
    borderColor: "#ddd",
    borderWidth: 1,
    backgroundColor: "#eee",
    borderRadius: 24,
  },
  input: {
    fontSize: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
  },
});
