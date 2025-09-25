import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useCalendarSizes } from "@/src/hooks/useCalendarSizes";
import { DaysHeader } from "@/src/components/DaysHeader";
import { MonthCalendar } from "@/src/components/MonthCalendar";

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
        if (
          !mostVisible ||
          item.viewablePercentage > (mostVisible.viewablePercentage || 0)
        ) {
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
  const renderMonth: ListRenderItem<(typeof monthsData)[0]> = useCallback(
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

  const sizes = useCalendarSizes();
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: sizes.month.height,
      offset: sizes.month.height * index,
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
      <DaysHeader />

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  calendarRow: {
    flexDirection: "row",
  },
});
