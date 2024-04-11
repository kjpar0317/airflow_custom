import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { useCallback } from "react";
import useSWR from "swr";
import gsap from "gsap";

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

  function doAnimatePageIn(element: string) {
    const animateDiv = document.querySelectorAll(element);

    if (animateDiv) {
      const tl = gsap.timeline();
      tl.set(animateDiv, {
        xPercent: 0,
      })
        .to(animateDiv, {
          xPercent: 100,
          duration: 0.8,
        })
        .to(
          animateDiv,
          {
            borderTopLeftRadius: "50vh",
            borderBottomLeftRadius: "50vh",
            duration: 0.4,
          },
          "<"
        );
    }
  }

  function doAnimatePageOut(
    element: string,
    href: string,
    router: AppRouterInstance
  ) {
    const animateDiv = document.querySelectorAll(element);

    if (animateDiv) {
      const tl = gsap.timeline();

      tl.set(animateDiv, {
        xPercent: -100,
        borderTopRightRadius: "50vh",
        borderBottomRightRadius: "50vh",
        borderTopLeftRadius: "0",
        borderBottomLeftRadius: "0",
      })
        .to(animateDiv, {
          xPercent: 0,
          duration: 0.8,
          onComplete: () => {
            router.push(href);
          },
        })
        .to(
          animateDiv,
          {
            borderTopRightRadius: "0",
            borderBottomRightRadius: "0",
            duration: 0.4,
          },
          "<"
        );
    }
  }

  return {
    theme,
    setTheme,
    doAnimatePageIn,
    doAnimatePageOut,
  };
}
