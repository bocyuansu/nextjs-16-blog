"use client";

import { EllipsisVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "../ui/toast";
import { deletePostAction } from "@/app/actions";

export default function BlogItemMenu({ postId }: { postId: Id<"posts"> }) {
  async function handleDelete() {
    try {
      await deletePostAction(postId);

      toast.add({
        type: "success",
        description: "成功刪除文章 !",
      });
    } catch (error) {
      console.error("刪除文章失敗:", error);
      toast.add({
        type: "error",
        description: "用戶未登入，刪除文章失敗 !",
        priority: "high",
      });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="secondary" className="absolute top-2 right-2 size-8">
            <EllipsisVertical />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-20">
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <Trash2 />
            刪除
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
