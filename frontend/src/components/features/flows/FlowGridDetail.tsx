import useFlow from "@/service/useFlow";
import FlowGridModal from "@/components/features/flows/modal/FlowGridModal";

interface IFlowGridDetail {
  key: React.Key;
  open: boolean;
  mode: string;
  row?: ICmpDag | undefined;
  onClose: (redraw: boolean) => void;
}

export default function FlowGridDetail({
  open,
  mode,
  row,
  onClose,
}: Readonly<IFlowGridDetail>) {
  const flow = useFlow();

  return (
    <>
      <div className="drawer-content">
        <FlowGridModal
          key={`${open}`}
          mode={mode}
          open={open}
          row={row}
          onClose={onClose}
        />
      </div>
      <div className="drawer-side z-[9999]">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
          <li>
            <a>Sidebar Item 1 {flow.currentNode?.id}</a>
          </li>
          <li>
            <a>Sidebar Item 2</a>
          </li>
        </ul>
      </div>
    </>
  );
}
