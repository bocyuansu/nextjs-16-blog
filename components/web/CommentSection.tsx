'use client';

// UI
import { Loader2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Field, FieldError } from '../ui/field';
import { Button } from '../ui/button';
import { toast } from '../ui/toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
// Convex
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react';
// Zod & React Hook Form
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { commentSchema } from '@/schemas/comment';
// Hook
import { useParams } from 'next/navigation';
import { useTransition } from 'react';

type CommentSectionProps = {
  preloadedComments: Preloaded<typeof api.comments.getCommentsByPostId>;
  username: string;
  isGuest: boolean;
};

export default function CommentSection({
  preloadedComments,
  username,
  isGuest,
}: CommentSectionProps) {
  const [isPending, startTransition] = useTransition();
  const params = useParams<{ postId: Id<'posts'> }>();
  const comments = usePreloadedQuery(preloadedComments);
  const createComment = useMutation(api.comments.createComment);
  const form = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      body: '',
      postId: params.postId,
    },
  });

  function onSubmit(data: z.infer<typeof commentSchema>) {
    startTransition(async () => {
      try {
        await createComment(data);
        form.reset();
        toast.add({
          type: 'success',
          description: '成功發布留言 !',
        });
      } catch (error) {
        console.error(error);
        toast.add({
          type: 'error',
          description: '發布留言失敗 !',
          priority: 'high',
        });
      }
    });
  }

  if (comments === undefined) {
    return <p>loading...</p>;
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 border-b">
        <MessageSquare className="size-5" />
        <h2 className="text-xl font-bold">{comments.length} 則留言</h2>
      </CardHeader>
      <CardContent className="space-y-8">
        {!isGuest && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="body"
              control={form.control}
              disabled={isGuest}
              render={({ field, fieldState }) => (
                <Field>
                  <span className="text-lg tracking-wide">{username}</span>
                  <Textarea
                    aria-invalid={fieldState.invalid}
                    placeholder="分享你的看法"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button
              type="submit"
              disabled={isGuest || isPending}
              className="text-base"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>提交中</span>
                </>
              ) : (
                <span>提交</span>
              )}
            </Button>
          </form>
        )}

        {comments.length > 0 && !isGuest && <Separator />}

        <section className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-4 items-start">
              <Avatar className="size-10">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${comment.authorName}`}
                  alt={comment.authorName}
                />
                <AvatarFallback>
                  {comment.authorName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm truncate">
                    {comment.authorName}
                  </p>
                  <p className="text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(comment._creationTime).toLocaleString('zh-TW', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed wrap-break-word ">
                  {comment.body}
                </p>
              </div>
            </div>
          ))}
        </section>
      </CardContent>
    </Card>
  );
}
