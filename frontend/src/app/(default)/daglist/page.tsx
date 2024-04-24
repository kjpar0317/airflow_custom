import type { ReactElement } from "react";

import DagList from "@/components/features/DagList";

export default async function DagListPage(): Promise<ReactElement> {
  return (
    <div className="w-full h-full flex justify-center">
      <DagList />
    </div>
  );
}
