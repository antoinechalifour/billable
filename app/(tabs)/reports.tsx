import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import FeatherIcons from '@expo/vector-icons/Feather';
import { powersync } from '../_layout';

interface ClientSummary {
  client_id: string;
  client_name: string;
  client_color: string;
  daily_rate: number;
  full_days: number;
  half_days: number;
  total_days: number;
  total_earnings: number;
}

interface MonthlySummary {
  total_days: number;
  total_earnings: number;
  clients: ClientSummary[];
}

export default function ReportsScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [summary, setSummary] = useState<MonthlySummary>({ total_days: 0, total_earnings: 0, clients: [] });

  useEffect(() => {
    loadMonthlySummary();
  }, [currentDate, loadMonthlySummary]);

  const loadMonthlySummary = useCallback(async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

      const result = await powersync.getAll(
        `SELECT 
          te.client_id,
          c.name as client_name,
          c.color as client_color,
          c.daily_rate,
          SUM(CASE WHEN te.duration_type = 'full_day' THEN 1 ELSE 0 END) as full_days,
          SUM(CASE WHEN te.duration_type = 'half_day' THEN 1 ELSE 0 END) as half_days,
          SUM(CASE WHEN te.duration_type = 'full_day' THEN 1 WHEN te.duration_type = 'half_day' THEN 0.5 ELSE 0 END) as total_days,
          SUM(CASE WHEN te.duration_type = 'full_day' THEN c.daily_rate WHEN te.duration_type = 'half_day' THEN c.daily_rate * 0.5 ELSE 0 END) as total_earnings
         FROM time_entries te
         JOIN clients c ON te.client_id = c.id
         WHERE te.date >= ? AND te.date <= ?
         GROUP BY te.client_id, c.name, c.color, c.daily_rate
         ORDER BY total_earnings DESC`,
        [startDate, endDate]
      );

      const clients: ClientSummary[] = result.map(row => ({
        client_id: row.client_id,
        client_name: row.client_name,
        client_color: row.client_color,
        daily_rate: row.daily_rate,
        full_days: row.full_days,
        half_days: row.half_days,
        total_days: row.total_days,
        total_earnings: row.total_earnings,
      }));

      const totalSummary = clients.reduce(
        (acc, client) => ({
          total_days: acc.total_days + client.total_days,
          total_earnings: acc.total_earnings + client.total_earnings,
        }),
        { total_days: 0, total_earnings: 0 }
      );

      setSummary({
        ...totalSummary,
        clients,
      });
    } catch (error) {
      console.error('Error loading monthly summary:', error);
    }
  }, [currentDate]);

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

  const renderClientSummary = ({ item }: { item: ClientSummary }) => (
    <View style={styles.clientCard}>
      <View style={styles.clientHeader}>
        <View style={styles.clientTitle}>
          <View style={[styles.colorIndicator, { backgroundColor: item.client_color }]} />
          <Text style={styles.clientName}>{item.client_name}</Text>
        </View>
        <Text style={styles.clientEarnings}>{item.total_earnings.toFixed(0)}€</Text>
      </View>
      
      <View style={styles.clientDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Days worked</Text>
          <Text style={styles.detailValue}>{item.total_days}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Full days</Text>
          <Text style={styles.detailValue}>{item.full_days}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Half days</Text>
          <Text style={styles.detailValue}>{item.half_days}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Rate</Text>
          <Text style={styles.detailValue}>{item.daily_rate}€/day</Text>
        </View>
      </View>
    </View>
  );

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
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Monthly Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{summary.total_days}</Text>
              <Text style={styles.statLabel}>Days Worked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.earningsValue]}>{summary.total_earnings.toFixed(0)}€</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Clients Breakdown</Text>
            <TouchableOpacity style={styles.exportButton}>
              <FeatherIcons name="file-text" size={16} color="#666" />
              <Text style={styles.exportText}>Export</Text>
            </TouchableOpacity>
          </View>

          {summary.clients.length > 0 ? (
            <FlatList
              data={summary.clients}
              renderItem={renderClientSummary}
              keyExtractor={(item) => item.client_id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No data for this month</Text>
              <Text style={styles.emptySubtext}>Start tracking time to see your earnings</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    padding: 16,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  earningsValue: {
    color: '#10B981',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 20,
  },
  section: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  exportText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  clientCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  clientEarnings: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  clientDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});