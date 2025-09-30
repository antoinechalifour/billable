import React from "react";
import { StyleSheet, TouchableOpacity, Text, TouchableOpacityProps } from "react-native";

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary";
}

export function AppButton({ title, variant = "primary", style, ...props }: AppButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "primary" ? styles.primaryButton : styles.secondaryButton,
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          styles.buttonText,
          variant === "primary" ? styles.primaryButtonText : styles.secondaryButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  primaryButtonText: {
    color: "#fff",
  },
  secondaryButtonText: {
    color: "#007AFF",
  },
});