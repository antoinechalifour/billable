import { useMemo } from "react";

export const useCurrentDate = () => useMemo(() => new Date(), []);