import React, {
  useMemo,
  useRef,
  useCallback,
  useState,
  useEffect,
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
import { useLocalSearchParams, useRouter } from "expo-router";

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
  // const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  // const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  // const [scrollY, setScrollY] = useState(0);

  // Large content area that allows negative scroll
  const contentHeight = 2000 * MONTH_HEIGHT;
  const contentPadding = 1000 * MONTH_HEIGHT; // Padding to allow negative scroll

  const currentDate = useMemo(() => new Date(), []);
  const paramMonth = params.month
    ? parseInt(params.month as string)
    : currentDate.getMonth();
  const paramYear = params.year
    ? parseInt(params.year as string)
    : currentDate.getFullYear();

  // const handleScroll = useCallback(
  //   (event: NativeSyntheticEvent<NativeScrollEvent>) => {
  //     const newScrollY = event.nativeEvent.contentOffset.y;
  //     setScrollY(newScrollY);
  //
  //     // Calculate month offset from scroll position (relative to contentPadding)
  //     // Use floor and add 0.5 threshold to prevent jumping between months
  //     const rawOffset = (newScrollY - contentPadding) / MONTH_HEIGHT;
  //     const monthOffset = Math.floor(rawOffset + 0.5);
  //
  //     if (monthOffset !== currentMonthOffset) {
  //       setCurrentMonthOffset(monthOffset);
  //       const { month, year } = getMonthData(
  //         paramYear,
  //         paramMonth,
  //         monthOffset,
  //       );
  //       router.setParams({ month: month.toString(), year: year.toString() });
  //     }
  //   },
  //   [currentMonthOffset, getMonthData, router, contentPadding],
  // );
  //
  // // Calculate which months should be visible based on scroll position
  // const visibleMonths = useMemo(() => {
  //   const rawOffset = (scrollY - contentPadding) / MONTH_HEIGHT;
  //   const currentOffset = Math.floor(rawOffset + 0.5);
  //   const months = [];
  //
  //   // Render current month + 1 before + 1 after for smooth scrolling
  //   for (let i = -1; i <= 1; i++) {
  //     const monthOffset = currentOffset + i;
  //     months.push({
  //       offset: monthOffset,
  //       y: monthOffset * MONTH_HEIGHT,
  //       component: (
  //         <MonthCalendar
  //           currentDate={currentDate}
  //           monthOffset={monthOffset}
  //           paramMonth={paramMonth}
  //           paramYear={paramYear}
  //         />
  //       ),
  //     });
  //   }
  //
  //   return months;
  // }, [scrollY, contentPadding, currentDate, paramMonth, paramYear]);
  //
  // useEffect(() => {
  //   if (scrollViewRef.current) {
  //     // Start at position 0 (current month)
  //     scrollViewRef.current.scrollTo({ y: contentPadding, animated: false });
  //     setScrollY(contentPadding);
  //   }
  // }, [contentPadding]);

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
        // onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { height: contentHeight },
        ]}
      >
        <MonthCalendar
          currentDate={currentDate}
          paramMonth={paramMonth}
          paramYear={paramYear}
          monthOffset={-2}
        />
        <MonthCalendar
          currentDate={currentDate}
          paramMonth={paramMonth}
          paramYear={paramYear}
          monthOffset={-1}
        />
        <MonthCalendar
          currentDate={currentDate}
          paramMonth={paramMonth}
          paramYear={paramYear}
          monthOffset={0}
        />
        <MonthCalendar
          currentDate={currentDate}
          paramMonth={paramMonth}
          paramYear={paramYear}
          monthOffset={1}
        />
        <MonthCalendar
          currentDate={currentDate}
          paramMonth={paramMonth}
          paramYear={paramYear}
          monthOffset={2}
        />
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
