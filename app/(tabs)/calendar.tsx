import React, { useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const CELL_WIDTH = (screenWidth - 32) / 7;
const HEADER_HEIGHT = 120;
const DAYS_HEADER_HEIGHT = 40;
const AVAILABLE_HEIGHT = screenHeight - HEADER_HEIGHT - DAYS_HEADER_HEIGHT - 100;
const CELL_HEIGHT = AVAILABLE_HEIGHT / 6;

const MONTHS_TO_RENDER = 24;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const currentDate = new Date();
  const paramMonth = params.month ? parseInt(params.month as string) : currentDate.getMonth();
  const paramYear = params.year ? parseInt(params.year as string) : currentDate.getFullYear();

  const getMonthData = (monthIndex: number) => {
    const baseDate = new Date(paramYear, paramMonth - 12 + monthIndex, 1);
    return {
      month: baseDate.getMonth(),
      year: baseDate.getFullYear(),
    };
  };

  const getCalendarDays = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getCalendarRows = (month: number, year: number) => {
    const days = getCalendarDays(month, year);
    const rows = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  };

  const renderCalendarDay = (day: number | null, index: number, month: number, year: number) => {
    const isToday = day && 
      day === currentDate.getDate() && 
      month === currentDate.getMonth() && 
      year === currentDate.getFullYear();

    return (
      <TouchableOpacity
        key={index}
        style={[styles.dayCell, isToday ? styles.todayCell : undefined]}
        disabled={!day}
      >
        <Text style={[styles.dayText, isToday ? styles.todayText : undefined]}>
          {day || ""}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMonth = useCallback((monthIndex: number) => {
    const { month, year } = getMonthData(monthIndex);
    const rows = getCalendarRows(month, year);

    return (
      <View key={monthIndex} style={styles.monthContainer}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthHeaderText}>
            {MONTHS[month]} {year}
          </Text>
        </View>
        
        <View style={styles.monthCalendar}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.calendarRow}>
              {row.map((day, dayIndex) => 
                renderCalendarDay(day, rowIndex * 7 + dayIndex, month, year)
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }, [paramMonth, paramYear]);

  const months = useMemo(() => {
    return Array.from({ length: MONTHS_TO_RENDER }, (_, i) => renderMonth(i));
  }, [renderMonth]);

  return (
    <View style={styles.container}>
      <View style={styles.daysHeader}>
        {DAYS.map((day) => (
          <View key={day} style={styles.dayHeaderCell}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {months}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingTop: 16,
  },
  daysHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#F2F2F7",
    zIndex: 1,
  },
  dayHeaderCell: {
    width: CELL_WIDTH,
    alignItems: "center",
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8E8E93",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  monthContainer: {
    marginBottom: 24,
  },
  monthHeader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  monthHeaderText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
  },
  monthCalendar: {
    // No flex wrap needed since we're using rows
  },
  calendarRow: {
    flexDirection: "row",
  },
  dayCell: {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    padding: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E5EA",
  },
  dayText: {
    fontSize: 16,
    color: "#000",
  },
  todayCell: {
    backgroundColor: "#007AFF10",
    borderTopColor: "#007AFF",
    borderTopWidth: 1,
  },
  todayText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
