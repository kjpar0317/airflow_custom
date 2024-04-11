import FlowGridModal from "./modal/FlowGridModal";
import FlowDrawer from "./layout/FlowDrawer";

interface IFlowGridDetail {
  key: React.Key;
  open: boolean;
  mode: string;
  row: ICmpDag | undefined;
  onClose: (redraw: boolean) => void;
}

export default function FlowGridDetail({
  open,
  mode,
  row,
  onClose,
}: Readonly<IFlowGridDetail>) {
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
        <FlowDrawer />
      </div>
    </>
  );
}
