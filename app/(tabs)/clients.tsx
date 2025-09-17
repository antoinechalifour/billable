import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import FeatherIcons from '@expo/vector-icons/Feather';
import { powersync } from '../_layout';

interface Client {
  id: string;
  name: string;
  color: string;
  daily_rate: number;
  created_at: string;
  updated_at: string;
}

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const result = await powersync.getAll('SELECT * FROM clients ORDER BY name');
      setClients(result);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const addTestClient = async () => {
    try {
      const id = `client_${Date.now()}`;
      const now = new Date().toISOString();
      await powersync.execute(
        'INSERT INTO clients (id, name, color, daily_rate, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, 'Test Client', '#3B82F6', 500, now, now]
      );
      loadClients();
    } catch (error) {
      console.error('Error adding client:', error);
      Alert.alert('Error', 'Failed to add client');
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      await powersync.execute('DELETE FROM clients WHERE id = ?', [clientId]);
      loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      Alert.alert('Error', 'Failed to delete client');
    }
  };

  const renderClient = ({ item }: { item: Client }) => (
    <View style={styles.clientItem}>
      <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.dailyRate}>{item.daily_rate}€/day</Text>
      </View>
      <TouchableOpacity
        onPress={() => deleteClient(item.id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clients</Text>
        <TouchableOpacity onPress={addTestClient} style={styles.addButton}>
          <FeatherIcons name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={clients}
        renderItem={renderClient}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No clients yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first client</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dailyRate: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});