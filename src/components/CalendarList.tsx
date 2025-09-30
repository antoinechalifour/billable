import { MonthHeader } from "@/src/components/MonthHeader";
import { ISODate, MonthCalendar } from "@/src/components/MonthCalendar";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";
import * as Haptics from "expo-haptics";
import { getCalendarSize } from "@/src/hooks/getCalendarSize";
import { DaysHeader } from "@/src/components/DaysHeader";
import {
  createIsoMonth,
  ISOMonth,
  isoMonthToDate,
} from "@/src/domain/ISOMonth";
import { getCalendarRows } from "@/src/domain/calendar";

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
  const [isoMonth, setIsoMonth] = useState<ISOMonth>(initialIsoMonth);

  const monthsData = useMemo(() => {
    const months = [];
    const baseDate = isoMonthToDate(initialIsoMonth);

    for (let i = -PAST_RANGE; i <= FUTURE_RANGE; i++) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
      months.push({
        isoMonth: createIsoMonth({
          month: date.getMonth(),
          year: date.getFullYear(),
        }),
        id: `${date.getFullYear()}-${date.getMonth()}`,
      });
    }
    return months;
  }, [initialIsoMonth]);

  const handleViewableItemsChanged = useCallback(
    ({
      viewableItems,
    }: {
      viewableItems: ViewToken<(typeof monthsData)[0]>[];
    }) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < 150) return;
      Haptics.selectionAsync();
      setIsoMonth(viewableItems[0].item.isoMonth);
    },
    [],
  );
  const renderMonth: ListRenderItem<(typeof monthsData)[0]> = useCallback(
    ({ item }) => (
      <MonthCalendar
        key={item.id}
        isoMonth={item.isoMonth}
        onDayPress={onDayPressed}
      />
    ),
    [onDayPressed],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => {
      let offset = 0;
      for (let i = 0; i < index; i++) {
        const size = getCalendarSize(monthsData[i].isoMonth);
        offset += size.month.height;
      }
      const currentSize = getCalendarSize(monthsData[index].isoMonth);
      return {
        length: currentSize.month.height,
        offset,
        index,
      };
    },
    [monthsData],
  );

  return (
    <View style={styles.container}>
      <MonthHeader isoMonth={isoMonth} />
      <DaysHeader isoMonth={isoMonth} />
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
    // backgroundColor: "",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
});
