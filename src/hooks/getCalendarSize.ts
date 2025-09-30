import { Dimensions } from "react-native";
import { getCalendarRows } from "@/src/domain/calendar";
import { ISOMonth, isoMonthToDate } from "@/src/domain/ISOMonth";

export function getCalendarSize(isoMonth: ISOMonth) {
  const { width: screenWidth } = Dimensions.get("window");
  const CELL_WIDTH = (screenWidth - 32) / 7;
  const CELL_HEIGHT = 70;

  const date = isoMonthToDate(isoMonth);
  const rows = getCalendarRows(date.getMonth(), date.getFullYear());
  const MONTH_HEIGHT = CELL_HEIGHT * rows.length + 36;

  return {
    cell: { width: CELL_WIDTH, height: CELL_HEIGHT },
    month: { height: MONTH_HEIGHT },
  };
}
