export type ISOMonth = `${number}-${number}`;

export const parseIsoMonth = (isoMonth: ISOMonth) => {
  const [year, month] = isoMonth.split("-").map(Number);
  return { year, month };
};

export const isoMonthToDate = (isoMonth: ISOMonth) => {
  const parsed = parseIsoMonth(isoMonth);
  return new Date(parsed.year, parsed.month, 1);
};
