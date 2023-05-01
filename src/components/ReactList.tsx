import type { AllowedPromptTypes } from "~/util/reactPrompt";
import { ReactListItem } from "./ReactListItem";

export type ReactListItemData = {
  id: string;
  text: string;
  authorName: string;
  type: AllowedPromptTypes;
};

type Props = {
  isTedProcessing: boolean;
  data: ReactListItemData[];
  onApproveListItemClick: (tweet: ReactListItemData) => Promise<void>;
  onDeleteListItemClick: (
    id: ReactListItemData["id"],
    type: ReactListItemData["type"]
  ) => void;
};

export function ReactList({
  data,
  isTedProcessing,
  onDeleteListItemClick,
  onApproveListItemClick,
}: Props) {
  return (
    <ul className="custom-scrollbar mt-5">
      {data.map((dataItem) => (
        <ReactListItem
          key={dataItem.id}
          type={dataItem.type}
          text={dataItem.text}
          authorName={dataItem.authorName}
          isTedProcessing={isTedProcessing}
          onApproveListItemClick={() => {
            onApproveListItemClick(dataItem).catch(() => console.error("err"));
          }}
          onDeleteListItemClick={() =>
            onDeleteListItemClick(dataItem.id, dataItem.type)
          }
        />
      ))}
    </ul>
  );
}
