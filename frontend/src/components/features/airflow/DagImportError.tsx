import type { ReactElement } from "react";

import { useCallback, useRef, memo } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import { cn } from "@/util/comm_util";
import useLayout from "@/service/useLayout";
import useAirflow from "@/service/useAirflow";

function DagImportError(): ReactElement {
  const { theme } = useLayout();
  const { importError, setErrorDagId } = useAirflow();
  const container = useRef(null);

  gsap.registerPlugin(useGSAP);

  useGSAP(
    () => {
      if (
        importError?.import_errors &&
        importError?.import_errors.length > 0 &&
        container
      ) {
        let timeline = gsap.timeline({});

        timeline.fromTo(
          container.current,
          { y: -120, opacity: 0 },
          {
            ease: "power3.inOut",
            duration: 0.8,
            y: 0,
            stagger: 0.2,
            opacity: 1,
          }
        );
      }
    },
    { scope: container }
  );

  const handleToggle = useCallback((index: number, isOpen: boolean) => {
    let timeline = gsap.timeline({});

    if (!isOpen) {
      timeline.fromTo(
        `#error-inner-body-${index}`,
        { opacity: 1, height: 45 },
        { opacity: 0, height: 0 }
      );
    } else {
      timeline.fromTo(
        `#error-inner-body-${index}`,
        { opacity: 0, height: 0 },
        { opacity: 1, height: 45 }
      );
    }
  }, []);

  const handleViewCode = useCallback(
    (filename: string) => {
      const arrFilenames = filename.split("/");

      if (arrFilenames && arrFilenames.length > 0) {
        const realFilename = arrFilenames[arrFilenames.length - 1];

        setErrorDagId(realFilename.replace(".py", ""));
      }
    },
    [setErrorDagId]
  );

  return (
    <>
      {importError?.import_errors && importError?.import_errors.length > 0 && (
        <div ref={container} className="w-full h-[120px] overflow-y-auto">
          {importError?.import_errors?.map(
            (error: IAirflowImportError, index: number) => (
              <div key={index} className="w-full mt-3">
                <div className="w-full text-gray-300 rounded-t shadow-lg overflow-hidden text-xs">
                  <div className="h-8 flex items-center p-2 justify-between bg-gradient-to-b from-gray-700 to-gray-800">
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-5 h-5 cursor-pointer"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <span className="font-bold select-none">
                        {error.filename}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 cursor-pointer hover:text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={() => handleToggle(index, true)}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                      <svg
                        className="w-4 h-4 cursor-pointer hover:text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={() => handleToggle(index, false)}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 15l7-7 7 7"
                        ></path>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-4 h-4 cursor-pointer hover:text-red-400"
                        onClick={() => handleViewCode(`${error.filename}`)}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div
                    id={`error-inner-body-${index}`}
                    className={cn(
                      "h-[45px] font-mono pl-1 pr-1",
                      theme === "dark"
                        ? "bg-gray-100 text-black"
                        : "bg-gray-900"
                    )}
                  >
                    <span className="text-green-500">➜</span>
                    <span className="text-cyan-500">~</span>
                    <span>{error.stack_trace}</span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </>
  );
}

export default memo(DagImportError);
