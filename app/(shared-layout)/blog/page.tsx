// UI
import BlogItem from "@/components/web/BlogItem";
//Convex
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
// Next
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";

export const metadata: Metadata = {
  title: "Blog | Next.js 16 Tutorial",
  description: "Read our latest articles and insights.",
  category: "Web development",
  keywords: ["Next.js", "React", "JavaScript"],
  authors: [{ name: "Cyuan" }],
};

export default function BlogPage() {
  return (
    <div className="py-12">
      <div className="text-center pb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Next <span className="text-primary">Blog</span>
        </h1>
        <p className="pt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
          Ideas worth keeping.
        </p>
      </div>

      <LoadBlogList />
    </div>
  );
}

async function LoadBlogList() {
  "use cache";
  cacheLife("days");
  cacheTag("blog");
  // fetchQuery 是一次性的非響應式查詢，不會建立持續的 WebSocket 訂閱
  const posts = await fetchQuery(api.posts.getPosts);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogItem key={post._id} post={post} />
      ))}
    </div>
  );
}

// function SkeletonLoadingUi() {
//   return (
//     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//       {[...Array(6)].map((_, i) => (
//         <div className="flex flex-col space-y-3" key={i}>
//           <Skeleton className="h-48 w-full rouned-t-lg" />
//           <div className="flex flex-col gap-y-2">
//             <Skeleton className="h-6 w-full" />
//             <Skeleton className="h-4 w-3/4" />
//             <Skeleton className="h-4 w-1/2" />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
