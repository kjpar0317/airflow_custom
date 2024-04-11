import type { ReactElement, FormEvent } from "react";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { PiCircuitry } from "react-icons/pi";

import usePrefersReducedMotion from "@/hook/usePrefersReducedMotion";
import useLayout from "@/service/useLayout";

export default function Header(): ReactElement {
  const router = useRouter();
  const container = useRef(null);
  const layout = useLayout();
  const prefersReducedMotion = usePrefersReducedMotion();

  gsap.registerPlugin(useGSAP);

  useGSAP(
    () => {
      if (prefersReducedMotion) {
        gsap.set(container.current, { opacity: 1 });
        return;
      }
      gsap.from(container.current, {
        duration: 1,
        y: "-100%",
        ease: "bounce",
        opacity: 0,
      });
      gsap.from("#site-header a", {
        duration: 1,
        opacity: 0,
        delay: 1,
        stagger: 0.1,
      });
    },
    { scope: container }
  );

  const handleToggleTheme = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      if (!e.currentTarget?.checked) {
        layout.setTheme("light");
      } else {
        layout.setTheme("dark");
      }
    },
    [layout]
  );

  const handleLink = useCallback(
    (url: string) => {
      layout.doAnimatePageOut("#transition-element", url, router);
    },
    [layout, router]
  );

  return (
    <header
      ref={container}
      id="site-header"
      className="header sticky top-0 bg-base-200 shadow-md flex items-center justify-between px-8 py-02"
    >
      <h1 className="w-3/12">
        <div className="justify-between h-[35px]">
          <div className="float-left w-[40px] h-[35px]">
            <a href="/">
              <PiCircuitry color="#22C55E" size="30" />
            </a>
          </div>
          <div className="text-left items-end h-[35px] content-center">
            DEMO SITE
          </div>
        </div>
      </h1>

      <nav className="nav font-semibold text-lg w-full pl-4">
        <ul className="flex items-center">
          <li
            className="p-4 border-b-2 border-primary border-opacity-0 hover:border-opacity-100 hover:text-primary duration-200 cursor-pointer text-sm active"
            onClick={() => handleLink("/")}
          >
            <a href="#home">DAG TASK</a>
          </li>
          <li
            className="p-4 border-b-2 border-primary border-opacity-0 hover:border-opacity-100 hover:text-primary duration-200 cursor-pointer text-sm active"
            onClick={() => handleLink("/test")}
          >
            <a href="#test">TEST</a>
          </li>
        </ul>
      </nav>

      <div className="w-3/12 flex justify-end">
        <label className="flex cursor-pointer gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
          </svg>
          <input
            type="checkbox"
            value="synthwave"
            className="toggle theme-controller"
            onChange={handleToggleTheme}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </label>
      </div>
    </header>
  );
}
