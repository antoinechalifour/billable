import React from "react";
import { StyleSheet, TextInput, TextInputProps, View, Text } from "react-native";

interface AppTextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  suffix?: string;
}

export function AppTextField({ label, error, suffix, style, ...props }: AppTextFieldProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#8e8e93"
          {...props}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    fontSize: 17,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#000",
    flex: 1,
  },
  suffix: {
    fontSize: 17,
    color: "#8e8e93",
    paddingRight: 16,
    fontWeight: "500",
  },
  error: {
    fontSize: 14,
    color: "#FF3B30",
    marginTop: 4,
    marginLeft: 4,
  },
});