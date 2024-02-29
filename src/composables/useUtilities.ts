interface UtilityComposable {
  /**
   * Returns a date object that is one week from the current date.
   */
  nextWeek: () => Date;

  /**
   * Returns the number of days from today to the given date.
   * @param date The date to compare to today.
   */
  daysFromToday: (date: Date) => number;
}

export function useUtilities(): UtilityComposable {
  const nextWeek = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  };

  const daysFromToday = (date: Date) => {
    const today = new Date();
    const diffTime = Math.abs(date.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return {
    nextWeek,
    daysFromToday
  };
}
