import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@powersync/react";
import { toCompilableQuery } from "@powersync/drizzle-driver";
import { clients, db, powersync } from "@/src/powersync/powersync";
import { uuid } from "expo-modules-core";

export const ClientsList = () => {
  const { data = [] } = useQuery(toCompilableQuery(db.select().from(clients)));
  return (
    <View style={styles.container}>
      <Text>Calendar Screen</Text>
      <FlatList
        data={data}
        renderItem={(item) => <Text>{item.item.id}</Text>}
      />
      <Button
        title="Setup"
        onPress={async () => {
          console.log("Init powersync");
          await powersync.init();
          console.log("Powersync initialized");
        }}
      />
      <Button
        title="Add client"
        onPress={async () => {
          console.log("Add client");
          await db
            .insert(clients)
            .values({ id: uuid.v4(), name: "coucou" })
            .execute();
          console.log("Client added");
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
