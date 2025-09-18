import React, {
  useMemo,
  useRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  ListRenderItem,
  ViewToken,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const CELL_WIDTH = (screenWidth - 32) / 7;
const HEADER_HEIGHT = 120;
const DAYS_HEADER_HEIGHT = 40;
const AVAILABLE_HEIGHT =
  screenHeight - HEADER_HEIGHT - DAYS_HEADER_HEIGHT - 100;
const CELL_HEIGHT = AVAILABLE_HEIGHT / 6;

const MONTH_HEIGHT = CELL_HEIGHT * 6 + 80; // 6 rows + header + padding

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

const getMonthData = (
  paramYear: number,
  paramMonth: number,
  monthOffset: number,
) => {
  const baseDate = new Date(paramYear, paramMonth + monthOffset, 1);
  return {
    month: baseDate.getMonth(),
    year: baseDate.getFullYear(),
  };
};

const MonthCalendar = ({
  currentDate,
  paramYear,
  paramMonth,
  monthOffset,
}: {
  currentDate: Date;
  paramYear: number;
  paramMonth: number;
  monthOffset: number;
}) => {
  // When monthOffset is 0, just use the passed month/year directly
  const month = monthOffset === 0 ? paramMonth : getMonthData(paramYear, paramMonth, monthOffset).month;
  const year = monthOffset === 0 ? paramYear : getMonthData(paramYear, paramMonth, monthOffset).year;
  const rows = getCalendarRows(month, year);

  const renderCalendarDay = (
    day: number | null,
    index: number,
    month: number,
    year: number,
  ) => {
    const isToday =
      day &&
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

  return (
    <View style={[styles.monthContainer, { height: MONTH_HEIGHT }]}>
      <View style={styles.monthHeader}>
        <Text style={styles.monthHeaderText}>
          {MONTHS[month]} {year}
        </Text>
      </View>

      <View style={styles.monthCalendar}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.calendarRow}>
            {row.map((day, dayIndex) =>
              renderCalendarDay(day, rowIndex * 7 + dayIndex, month, year),
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default function CalendarScreen() {
  const params2 = useLocalSearchParams();
  const currentDate = useMemo(() => new Date(), []);

  const [{ paramYear, paramMonth }, setParams] = useState(() => {
    const paramMonth = params2.month
      ? parseInt(params2.month as string)
      : currentDate.getMonth();
    const paramYear = params2.year
      ? parseInt(params2.year as string)
      : currentDate.getFullYear();
    return { paramMonth, paramYear };
  });
  const flatListRef = useRef<FlatList>(null);
  const lastUpdateRef = useRef(0);

  // Generate months data for FlatList (±24 months)
  const PAST_RANGE = 24;
  const FUTURE_RANGE = 24;
  
  const monthsData = useMemo(() => {
    const months = [];
    const baseDate = new Date(paramYear, paramMonth, 1);
    
    for (let i = -PAST_RANGE; i <= FUTURE_RANGE; i++) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
      months.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        monthOffset: i,
        id: `${date.getFullYear()}-${date.getMonth()}`,
      });
    }
    return months;
  }, [paramYear, paramMonth]);

  const initialScrollIndex = PAST_RANGE; // Center current month

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      // Debounce updates
      const now = Date.now();
      if (now - lastUpdateRef.current < 150) return;
      
      // Find the most visible item (highest viewablePercentage)
      let mostVisible = viewableItems[0];
      for (const item of viewableItems) {
        if (!item.item || !item.viewablePercentage) continue;
        if (!mostVisible || (item.viewablePercentage > (mostVisible.viewablePercentage || 0))) {
          mostVisible = item;
        }
      }
      
      if (mostVisible?.item && (mostVisible.viewablePercentage || 0) > 60) {
        const { month, year } = mostVisible.item;
        if (month !== paramMonth || year !== paramYear) {
          lastUpdateRef.current = now;
          setParams({ paramMonth: month, paramYear: year });
        }
      }
    },
    [paramMonth, paramYear, setParams],
  );
  const renderMonth: ListRenderItem<typeof monthsData[0]> = useCallback(
    ({ item }) => (
      <MonthCalendar
        key={item.id}
        currentDate={currentDate}
        paramMonth={item.month}
        paramYear={item.year}
        monthOffset={0} // Not needed anymore since each item has its own month/year
      />
    ),
    [currentDate],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: MONTH_HEIGHT,
      offset: MONTH_HEIGHT * index,
      index,
    }),
    [],
  );

  const viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 50,
    waitForInteraction: true,
  };

  return (
    <View style={styles.container}>
      <View style={styles.daysHeader}>
        {DAYS.map((day) => (
          <View key={day} style={styles.dayHeaderCell}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>

      <FlatList
        ref={flatListRef}
        data={monthsData}
        renderItem={renderMonth}
        keyExtractor={(item) => item.id}
        getItemLayout={getItemLayout}
        initialScrollIndex={initialScrollIndex}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
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
