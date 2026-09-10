// UI
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
//Convex
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
// Next
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";

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
      {posts?.map((post) => (
        <Card key={post._id} className="pt-0">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={
                post.imageUrl ??
                "https://images.unsplash.com/photo-1526779259212-939e64788e3c?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              }
              alt="image"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-t-lg object-cover"
            />
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
