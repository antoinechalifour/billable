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
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
  const { month, year } = getMonthData(paramYear, paramMonth, monthOffset);
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
  const scrollViewRef = useRef<ScrollView>(null);
  const calendarPositions = useRef<number[]>([0, 0, 0, 0, 0]);
  const scrollY = useRef(0);
  const lastUpdateRef = useRef(0);

  // Static window of 5 calendars: [-2, -1, 0, 1, 2] relative to current month
  const monthOffsets = [-2, -1, 0, 1, 2];

  // Calculate positions for each calendar
  useMemo(() => {
    calendarPositions.current = monthOffsets.map(
      (_, index) => index * MONTH_HEIGHT,
    );
  }, [monthOffsets]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newScrollY = event.nativeEvent.contentOffset.y;
      scrollY.current = newScrollY;

      // Debounce route updates to prevent rapid changes
      const now = Date.now();
      if (now - lastUpdateRef.current < 150) return;

      // Find which calendar is most visible (>60% threshold)
      let mostVisibleIndex = 2; // Default to center calendar
      let maxVisibility = 0;

      calendarPositions.current.forEach((position, index) => {
        const calendarTop = position;
        const calendarBottom = position + MONTH_HEIGHT;

        // Calculate visible portion
        const visibleTop = Math.max(calendarTop, newScrollY);
        const visibleBottom = Math.min(
          calendarBottom,
          newScrollY + AVAILABLE_HEIGHT,
        );
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visibilityPercent = visibleHeight / MONTH_HEIGHT;

        if (visibilityPercent > maxVisibility && visibilityPercent > 0.6) {
          maxVisibility = visibilityPercent;
          mostVisibleIndex = index;
        }
      });

      // Update route params if main calendar changed
      const newMainOffset = monthOffsets[mostVisibleIndex];
      if (newMainOffset !== 0) {
        lastUpdateRef.current = now;
        const { month, year } = getMonthData(
          paramYear,
          paramMonth,
          newMainOffset,
        );
        setParams({ paramMonth: month, paramYear: year });
      }
    },
    [paramYear, paramMonth, setParams, monthOffsets],
  );
  // Track previous params to calculate position adjustments
  const prevParamsRef = useRef({ month: paramMonth, year: paramYear });

  // Initial scroll positioning
  useEffect(() => {
    if (scrollViewRef.current) {
      // Center the current month (offset 0, which is at index 2)
      const centerPosition = calendarPositions.current[2];
      scrollViewRef.current.scrollTo({ y: centerPosition, animated: false });
      scrollY.current = centerPosition;
    }
  }, []);

  // Recalculate scroll position when route params change
  useEffect(() => {
    if (scrollViewRef.current) {
      const prevMonth = prevParamsRef.current.month;
      const prevYear = prevParamsRef.current.year;

      // Skip on initial mount
      if (prevMonth === paramMonth && prevYear === paramYear) {
        return;
      }

      // Calculate how many months we shifted
      const prevDate = new Date(prevYear, prevMonth);
      const newDate = new Date(paramYear, paramMonth);
      const monthsDiff =
        (newDate.getFullYear() - prevDate.getFullYear()) * 12 +
        (newDate.getMonth() - prevDate.getMonth());

      if (monthsDiff !== 0) {
        // Adjust scroll position to maintain visual continuity
        const currentScrollY = scrollY.current;
        const newScrollY = currentScrollY - monthsDiff * MONTH_HEIGHT;

        // Ensure scroll position stays within bounds
        const maxScroll = Math.max(0, MONTH_HEIGHT * 5 - AVAILABLE_HEIGHT);
        const adjustedScrollY = Math.max(0, Math.min(newScrollY, maxScroll));

        scrollViewRef.current.scrollTo({ y: adjustedScrollY, animated: false });
        scrollY.current = adjustedScrollY;
      }

      // Update previous params
      prevParamsRef.current = { month: paramMonth, year: paramYear };
    }
  }, [paramMonth, paramYear]);

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
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { height: MONTH_HEIGHT * 5 },
        ]}
      >
        {monthOffsets.map((offset, index) => (
          <MonthCalendar
            key={`${paramYear}-${paramMonth}-${offset}`}
            currentDate={currentDate}
            paramMonth={paramMonth}
            paramYear={paramYear}
            monthOffset={offset}
          />
        ))}
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
