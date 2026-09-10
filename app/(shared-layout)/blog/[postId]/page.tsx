// UI
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
// Convex & Auth
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { fetchAuthQuery } from "@/lib/auth-server";
// Next
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
// Component
import CommentSection from "@/components/web/CommentSection";
import PostPresence from "@/components/web/PostPresence";
// Markdown
import MarkDownRender from "@/components/web/MarkDownRender";

interface PostIdRouteProps {
  params: Promise<{
    postId: Id<"posts">;
  }>;
}

export async function generateMetadata({
  params,
}: PostIdRouteProps): Promise<Metadata> {
  const { postId } = await params;

  const post = await fetchQuery(api.posts.getPostById, { postId: postId });

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.body,
  };
}

export default async function PostIdRoute({ params }: PostIdRouteProps) {
  const { postId } = await params;

  const user = await fetchAuthQuery(api.auth.getCurrentUser, {});

  // 所有請求並行(Parallel)
  const [post, preloadedComments] = await Promise.all([
    fetchQuery(api.posts.getPostById, { postId: postId }),
    preloadQuery(api.comments.getCommentsByPostId, {
      postId,
    }),
  ]);

  if (!post) {
    return <p>沒有文章</p>;
  }

  // 格式化日期
  const date = new Date(post._creationTime);
  const formatDate = date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500 relative">
      <Link
        href="/blog"
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
      >
        <ArrowLeft className="size-4" />
        Back to blog
      </Link>

      <div className="relative w-full h-100 mb-8 rounded-xl overflow-hidden shadow-sm">
        <Image
          src={
            post?.imageUrl ??
            "https://images.unsplash.com/photo-1526779259212-939e64788e3c?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="eager"
          className="object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="flex flex-col gap-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {post.title}
        </h1>

        <div className="space-y-2">
          <p className="text-muted-foreground">建立日期：{formatDate}</p>
          {!user ? null : <PostPresence roomId={postId} userId={user._id} />}
        </div>
      </div>

      <Separator className="my-8" />

      <MarkDownRender markdown={post.body} />

      <Separator className="my-8" />

      <CommentSection
        preloadedComments={preloadedComments}
        username={user ? user.name : "訪客"}
        isGuest={!user}
      />
    </div>
  );
}
