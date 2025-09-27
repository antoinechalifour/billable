import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCalendarSizes } from "@/src/hooks/useCalendarSizes";
import { DaysHeader } from "@/src/components/DaysHeader";
import { MonthCalendar } from "@/src/components/MonthCalendar";
import * as Haptics from "expo-haptics";
import { ISOMonth, MonthHeader } from "@/src/components/MonthHeader";
import { useCurrentDate } from "@/src/hooks/useCurrentDate";

const viewabilityConfig = {
  viewAreaCoveragePercentThreshold: 50,
  waitForInteraction: true,
};

export default function CalendarScreen() {
  const params2 = useLocalSearchParams();
  const currentDate = useCurrentDate();
  const [{ paramYear, paramMonth }, setParams] = useState(() => {
    const paramMonth = params2.month
      ? parseInt(params2.month as string)
      : currentDate.getMonth();
    const paramYear = params2.year
      ? parseInt(params2.year as string)
      : currentDate.getFullYear();
    return { paramMonth, paramYear };
  });
  const lastUpdateRef = useRef(0);
  const [isoMonth, setIsoMonth] = useState<ISOMonth>(
    `${paramYear}-${paramMonth}`,
  );

  // Generate months data for FlatList (±24 months)
  const PAST_RANGE = 6;
  const FUTURE_RANGE = 48;

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
      const now = Date.now();
      if (now - lastUpdateRef.current < 150) return;

      let mostVisible = viewableItems[0];

      Haptics.selectionAsync();
      const { month, year } = mostVisible.item;
      setIsoMonth(`${year}-${month}`);
    },
    [],
  );
  const router = useRouter();
  const renderMonth: ListRenderItem<(typeof monthsData)[0]> = useCallback(
    ({ item }) => (
      <MonthCalendar
        key={item.id}
        currentDate={currentDate}
        paramMonth={item.month}
        paramYear={item.year}
        monthOffset={0} // Not needed anymore since each item has its own month/year
        onDayPress={(isoDate) => {
          router.push("/test");
        }}
      />
    ),
    [currentDate, router],
  );

  const sizes = useCalendarSizes();
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: sizes.month.height,
      offset: sizes.month.height * index,
      index,
    }),
    [sizes.month.height],
  );

  return (
    <View style={styles.container}>
      <MonthHeader isoMonth={isoMonth} />
      <DaysHeader />
      <FlatList
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
});

const modalStyles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
});
