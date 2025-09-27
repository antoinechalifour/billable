import {
  ISOMonth,
  MonthHeader,
  parseIsoMonth,
} from "@/src/components/MonthHeader";
import { ISODate, MonthCalendar } from "@/src/components/MonthCalendar";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useCurrentDate } from "@/src/hooks/useCurrentDate";
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useCalendarSizes } from "@/src/hooks/useCalendarSizes";
import { DaysHeader } from "@/src/components/DaysHeader";

const viewabilityConfig = {
  viewAreaCoveragePercentThreshold: 50,
  waitForInteraction: true,
};

const PAST_RANGE = 6;
const FUTURE_RANGE = 48;

export const CalendarList = ({
  initialIsoMonth,
  onDayPressed,
}: {
  initialIsoMonth: ISOMonth;
  onDayPressed: (day: ISODate) => void;
}) => {
  const lastUpdateRef = useRef(0);
  const currentDate = useCurrentDate();
  const [isoMonth, setIsoMonth] = useState<ISOMonth>(initialIsoMonth);

  const monthsData = useMemo(() => {
    const months = [];
    const parsed = parseIsoMonth(initialIsoMonth);
    const baseDate = new Date(parsed.year, parsed.month, 1);

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
  }, [initialIsoMonth]);

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
  const renderMonth: ListRenderItem<(typeof monthsData)[0]> = useCallback(
    ({ item }) => (
      <MonthCalendar
        key={item.id}
        currentDate={currentDate}
        paramMonth={item.month}
        paramYear={item.year}
        monthOffset={0}
        onDayPress={onDayPressed}
      />
    ),
    [currentDate, onDayPressed],
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
        initialScrollIndex={PAST_RANGE}
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
};

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
