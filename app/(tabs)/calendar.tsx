import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import FeatherIcons from '@expo/vector-icons/Feather';
import { powersync } from '../_layout';

interface Client {
  id: string;
  name: string;
  color: string;
  daily_rate: number;
}

interface TimeEntry {
  id: string;
  client_id: string;
  date: string;
  duration_type: 'full_day' | 'half_day';
  notes: string;
  client?: Client;
}

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const loadTimeEntries = useCallback(async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
      
      const result = await powersync.getAll(
        `SELECT te.*, c.name as client_name, c.color as client_color, c.daily_rate 
         FROM time_entries te 
         LEFT JOIN clients c ON te.client_id = c.id 
         WHERE te.date >= ? AND te.date <= ? 
         ORDER BY te.date DESC`,
        [startDate, endDate]
      );
      
      setTimeEntries(result.map(entry => ({
        ...entry,
        client: entry.client_name ? {
          id: entry.client_id,
          name: entry.client_name,
          color: entry.client_color,
          daily_rate: entry.daily_rate
        } : undefined
      })));
    } catch (error) {
      console.error('Error loading time entries:', error);
    }
  }, [currentDate]);

  const loadClients = useCallback(async () => {
    try {
      const result = await powersync.getAll('SELECT * FROM clients ORDER BY name');
      setClients(result);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([loadTimeEntries(), loadClients()]);
  }, [loadTimeEntries, loadClients]);

  useEffect(() => {
    loadData();
  }, [currentDate, loadData]);

  const addTimeEntry = async () => {
    if (clients.length === 0) {
      Alert.alert('No Clients', 'Please add a client first before tracking time.');
      return;
    }

    Alert.alert(
      'Add Time Entry',
      'Select duration for today',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Half Day',
          onPress: () => selectClient('half_day'),
        },
        {
          text: 'Full Day',
          onPress: () => selectClient('full_day'),
        },
      ]
    );
  };

  const selectClient = (durationType: 'full_day' | 'half_day') => {
    const clientOptions = clients.map(client => ({
      text: client.name,
      onPress: () => createTimeEntry(client.id, durationType),
    }));

    Alert.alert(
      'Select Client',
      'Which client did you work for?',
      [
        { text: 'Cancel', style: 'cancel' },
        ...clientOptions,
      ]
    );
  };

  const createTimeEntry = async (clientId: string, durationType: 'full_day' | 'half_day') => {
    try {
      const id = `entry_${Date.now()}`;
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      await powersync.execute(
        'INSERT INTO time_entries (id, client_id, date, duration_type, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, clientId, today, durationType, '', now, now]
      );
      
      loadTimeEntries();
    } catch (error) {
      console.error('Error creating time entry:', error);
      Alert.alert('Error', 'Failed to add time entry');
    }
  };

  const deleteTimeEntry = async (entryId: string) => {
    try {
      await powersync.execute('DELETE FROM time_entries WHERE id = ?', [entryId]);
      loadTimeEntries();
    } catch (error) {
      console.error('Error deleting time entry:', error);
      Alert.alert('Error', 'Failed to delete time entry');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderTimeEntry = ({ item }: { item: TimeEntry }) => {
    const earnings = item.client ? 
      (item.duration_type === 'full_day' ? item.client.daily_rate : item.client.daily_rate / 2) : 0;

    return (
      <View style={styles.entryItem}>
        <View style={styles.entryHeader}>
          <View style={styles.entryInfo}>
            <View style={styles.entryTitle}>
              {item.client && (
                <View style={[styles.clientIndicator, { backgroundColor: item.client.color }]} />
              )}
              <Text style={styles.clientName}>{item.client?.name || 'Unknown Client'}</Text>
            </View>
            <Text style={styles.entryDate}>{item.date}</Text>
          </View>
          <TouchableOpacity
            onPress={() => deleteTimeEntry(item.id)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.entryDetails}>
          <Text style={styles.duration}>
            {item.duration_type === 'full_day' ? 'Full Day' : 'Half Day'}
          </Text>
          <Text style={styles.earnings}>+{earnings}€</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={previousMonth} style={styles.navButton}>
            <FeatherIcons name="chevron-left" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{formatDate(currentDate)}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
            <FeatherIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={addTimeEntry} style={styles.addButton}>
          <FeatherIcons name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={timeEntries}
        renderItem={renderTimeEntry}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No time entries this month</Text>
            <Text style={styles.emptySubtext}>Tap + to track your first day</Text>
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
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
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
  entryItem: {
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clientIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  entryDate: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    fontSize: 14,
    color: '#666',
  },
  earnings: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
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