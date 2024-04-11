import DagTask from "@/components/features/DagTask";

// json stringfy 시 bigint 문제
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default async function AppPage() {
  return (
    <div className="w-full h-full flex justify-center">
      <DagTask />
    </div>
  );
}
