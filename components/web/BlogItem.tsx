"use client";

import { EllipsisVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button, buttonVariants } from "../ui/button";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { toast } from "../ui/toast";
import { deletePostAction } from "@/app/actions";
import { Authenticated, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardFooter } from "../ui/card";
import Image from "next/image";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useState } from "react";

type BlogItemProps = {
  post: Doc<"posts"> & {
    imageUrl: string | null;
  };
};

export default function BlogItem({ post }: BlogItemProps) {
  return (
    <Card key={post._id} className="pt-0">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={
            post.imageUrl ??
            "https://images.unsplash.com/photo-1526779259212-939e64788e3c?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          alt="image"
          fill
          loading="eager"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-t-lg object-cover"
        />
        <Authenticated>
          <BlogItemMenu postId={post._id} authorId={post.authorId} />
        </Authenticated>
      </div>

      <CardContent className="flex-1">
        <Link href={`/blog/${post._id}`}>
          <h1 className="text-2xl font-bold hover:text-primary">
            {post.title}
          </h1>
        </Link>
        <p className="text-muted-foreground">{post.body.slice(0, 120)}</p>
      </CardContent>

      <CardFooter>
        <Link
          className={buttonVariants({ className: "w-full text-lg" })}
          href={`/blog/${post._id}`}
        >
          Read more
        </Link>
      </CardFooter>
    </Card>
  );
}

type BlogItemMenuProps = {
  postId: Id<"posts">;
  authorId: Doc<"posts">["authorId"];
};

function BlogItemMenu({ postId, authorId }: BlogItemMenuProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const user = useQuery(api.auth.getCurrentUser);

  if (!user || authorId !== user._id) {
    return null;
  }

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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="secondary"
              className="absolute top-2 right-2 size-8"
            />
          }
        >
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-20">
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 />
              刪除
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>確定要刪除這篇文章嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              文章刪除後將無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              確定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
