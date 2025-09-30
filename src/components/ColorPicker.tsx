import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";

const PRESET_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FECA57",
  "#FF9FF3",
  "#54A0FF",
  "#5F27CD",
];

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  label?: string;
  error?: string;
}

export function ColorPicker({ selectedColor, onColorSelect, label, error }: ColorPickerProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.colorPicker}>
        {PRESET_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColor,
            ]}
            onPress={() => onColorSelect(color)}
          />
        ))}
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
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 4,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#007AFF",
    borderWidth: 3,
  },
  error: {
    fontSize: 14,
    color: "#FF3B30",
    marginTop: 4,
    marginLeft: 4,
  },
});