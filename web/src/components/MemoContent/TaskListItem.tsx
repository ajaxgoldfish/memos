import { Checkbox } from "@mui/joy";
import clsx from "clsx";
import { repeat } from "lodash-es";
import { useContext, useState } from "react";
import { markdownServiceClient } from "@/grpcweb";
import { useMemoStore } from "@/store/v1";
import { Node, TaskListItemNode } from "@/types/proto/api/v1/markdown_service";
import Renderer from "./Renderer";
import { RendererContext } from "./types";

interface Props {
  node: Node;
  index: string;
  symbol: string;
  indent: number;
  complete: boolean;
  children: Node[];
}

const TaskListItem: React.FC<Props> = ({ node, indent, complete, children }: Props) => {
  const context = useContext(RendererContext);
  const memoStore = useMemoStore();
  const [checked] = useState(complete);

  const handleCheckboxChange = async (on: boolean) => {
    if (context.readonly || !context.memoName) {
      return;
    }

    (node.taskListItemNode as TaskListItemNode)!.complete = on;
    const { markdown } = await markdownServiceClient.restoreMarkdownNodes({ nodes: context.nodes });
    await memoStore.updateMemo(
      {
        name: context.memoName,
        content: markdown,
      },
      ["content"],
    );
  };

  return (
    <li className="w-full flex flex-row">
      {indent > 0 && (
        <div className="block font-mono shrink-0">
          <span>{repeat(" ", indent)}</span>
        </div>
      )}
      <div className="w-auto grid grid-cols-[24px_1fr] gap-1">
        <div className="w-7 h-6 flex justify-center items-center">
          <Checkbox size="sm" checked={checked} disabled={context.readonly} onChange={(e) => handleCheckboxChange(e.target.checked)} />
        </div>
        <div className={clsx(complete && "line-through opacity-80")}>
          {children.map((child, index) => (
            <Renderer key={`${child.type}-${index}`} index={String(index)} node={child} />
          ))}
        </div>
      </div>
    </li>
  );
};

export default TaskListItem;
