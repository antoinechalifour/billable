import { Dimensions } from "react-native";

export function getCalendarSize() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const CELL_WIDTH = (screenWidth - 32) / 7;
  const HEADER_HEIGHT = 120;
  const DAYS_HEADER_HEIGHT = 40;
  const AVAILABLE_HEIGHT =
    screenHeight - HEADER_HEIGHT - DAYS_HEADER_HEIGHT - 500;
  const CELL_HEIGHT = AVAILABLE_HEIGHT / 6;
  const MONTH_HEIGHT = AVAILABLE_HEIGHT + 25;

  return {
    cell: { width: CELL_WIDTH, height: CELL_HEIGHT },
    month: { height: MONTH_HEIGHT },
  };
}
