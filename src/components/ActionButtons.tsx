import { useTedStore } from "~/util/ted";

export function ActionButtons() {
  const { isTedProcessing, addToPromptQueue } = useTedStore((state) => ({
    isTedProcessing: state.isTedProcessing,
    addToPromptQueue: state.addToPromptQueue,
  }));

  return (
    <div className="flex flex-row items-center">
      <button
        disabled={isTedProcessing}
        onClick={() =>
          addToPromptQueue({
            status: "new",
            readTheQuestion: false,
            message: "Thank your viewers for the follows",
          })
        }
        className={`rounded bg-indigo-800 p-2 uppercase text-white hover:bg-indigo-400 ${
          isTedProcessing ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        Thank for the follows
      </button>
    </div>
  );
}
