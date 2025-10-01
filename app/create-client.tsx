import React from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppTextField } from "../src/components/AppTextField";
import { AppButton } from "../src/components/AppButton";
import { ColorPicker } from "../src/components/ColorPicker";
import { clientSchema, ClientFormData } from "../src/schemas/clientSchema";
import { clients, db } from "@/src/powersync/powersync";
import { uuid } from "expo-modules-core";

export default function CreateClientScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      pricePerDay: 600,
      color: "#FF6B6B",
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    await db
      .insert(clients)
      .values({
        id: uuid.v4(),
        name: data.name,
        color: data.color,
      })
      .run();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Create your first client to get started
        </Text>
        <Text style={styles.subtitle}>
          Add your first client to start tracking billable time
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <AppTextField
              label="Client name"
              placeholder="Enter client name"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="pricePerDay"
          render={({ field: { onChange, value } }) => (
            <AppTextField
              label="Price per day"
              placeholder="0"
              value={value?.toString() || ""}
              onChangeText={(text) => {
                const numValue = parseFloat(text);
                onChange(isNaN(numValue) ? undefined : numValue);
              }}
              keyboardType="numeric"
              suffix="€"
              error={errors.pricePerDay?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="color"
          render={({ field: { onChange, value } }) => (
            <ColorPicker
              label="Color"
              selectedColor={value}
              onColorSelect={onChange}
              error={errors.color?.message}
            />
          )}
        />
      </View>

      <AppButton
        title="Create client"
        onPress={handleSubmit(onSubmit)}
        style={styles.submitButton}
      />
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
  header: {
    marginBottom: 32,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#8e8e93",
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
