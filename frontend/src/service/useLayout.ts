import { useCallback } from "react";
import useSWR from "swr";

let _theme: string = "light";

export default function useLayout() {
  const { data: theme, mutate: currentTheme } = useSWR<string>(
    "theme",
    () => _theme
  );

  const setTheme = useCallback(
    (stheme: string) => {
      _theme = stheme;
      return currentTheme();
    },
    [currentTheme]
  );

  return {
    theme,
    setTheme,
  };
}
