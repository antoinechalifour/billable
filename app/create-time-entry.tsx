import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Redirect } from "expo-router";
import { useSuspenseQuery } from "@powersync/react";
import { toCompilableQuery } from "@powersync/drizzle-driver";
import { clients, db } from "@/src/powersync/powersync";

interface Client {
  id: string;
  name: string;
  price: string;
  color: string;
}

interface TimeEntryForm {
  clientId?: string;
  duration: "day" | "halfday";
  notes: string;
}

interface NewClientForm {
  name: string;
  price: string;
  color: string;
}

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

const query = db.select().from(clients);
export default function CreateTimeEntryScreen() {
  const { data: existingClients } = useSuspenseQuery(toCompilableQuery(query));
  const [showNewClientForm, setShowNewClientForm] = useState(
    existingClients.length === 0,
  );
  const [timeEntry, setTimeEntry] = useState<TimeEntryForm>({
    duration: "day",
    notes: "",
  });
  const [newClient, setNewClient] = useState<NewClientForm>({
    name: "",
    price: "",
    color: PRESET_COLORS[0],
  });

  if (existingClients.length === 0) {
    return <Redirect href="/create-client" />;
  }

  const handleSubmit = () => {
    console.log("Time Entry:", timeEntry);
    console.log(
      "New Client (if creating):",
      showNewClientForm ? newClient : null,
    );
  };

  const renderClientSection = () => {
    if (existingClients.length === 0 || showNewClientForm) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Client</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Client name"
              value={newClient.name}
              onChangeText={(text) =>
                setNewClient((prev) => ({ ...prev, name: text }))
              }
            />
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              placeholder="Hourly rate"
              value={newClient.price}
              onChangeText={(text) =>
                setNewClient((prev) => ({ ...prev, price: text }))
              }
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.label}>Color</Text>
          <View style={styles.colorPicker}>
            {PRESET_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  newClient.color === color && styles.selectedColor,
                ]}
                onPress={() => setNewClient((prev) => ({ ...prev, color }))}
              />
            ))}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client</Text>
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.selectButton}>
            <Text style={styles.selectButtonText}>Select client</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={() => setShowNewClientForm(true)}
        >
          <Text style={styles.addNewButtonText}>+ Add new client</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {renderClientSection()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Duration</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              styles.segmentButtonLeft,
              timeEntry.duration === "halfday" && styles.segmentButtonActive,
            ]}
            onPress={() =>
              setTimeEntry((prev) => ({ ...prev, duration: "halfday" }))
            }
          >
            <Text
              style={[
                styles.segmentButtonText,
                timeEntry.duration === "halfday" &&
                  styles.segmentButtonTextActive,
              ]}
            >
              Half Day
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              styles.segmentButtonRight,
              timeEntry.duration === "day" && styles.segmentButtonActive,
            ]}
            onPress={() =>
              setTimeEntry((prev) => ({ ...prev, duration: "day" }))
            }
          >
            <Text
              style={[
                styles.segmentButtonText,
                timeEntry.duration === "day" && styles.segmentButtonTextActive,
              ]}
            >
              Full Day
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <View style={styles.inputContainer}>
          <TextInput
            numberOfLines={4}
            multiline
            style={[styles.input, styles.notesInput]}
            placeholder="Add notes about this time entry..."
            value={timeEntry.notes}
            onChangeText={(text) =>
              setTimeEntry((prev) => ({ ...prev, notes: text }))
            }
          />
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Create Time Entry</Text>
      </TouchableOpacity>
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
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
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
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  divider: {
    height: 0.5,
    backgroundColor: "#e0e0e0",
    marginLeft: 16,
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
  selectButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectButtonText: {
    fontSize: 17,
    color: "#000",
  },
  addNewButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  addNewButtonText: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "500",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#f2f2f7",
    borderRadius: 8,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  segmentButtonLeft: {
    marginRight: 1,
  },
  segmentButtonRight: {
    marginLeft: 1,
  },
  segmentButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  segmentButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8e8e93",
  },
  segmentButtonTextActive: {
    color: "#000",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
});
