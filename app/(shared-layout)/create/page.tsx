"use client";

import { createPostAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { postSchema } from "@/schemas/blog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { AppWindowIcon, Loader2, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarkDownRender from "@/components/web/MarkDownRender";

export default function CreatePage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const generateUploadUrl = useMutation(api.posts.generateImageUpload);

  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      image: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof postSchema>) {
    startTransition(async () => {
      try {
        let storageId: Id<"_storage"> | undefined;

        // 如果表單中有選擇圖片，先在前端完成上傳
        if (values.image) {
          // 1. 取得上傳網址（確認用戶已登入才生成）
          const uploadUrl = await generateUploadUrl();

          // 2. 上傳圖片
          const uploadResult = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": values.image.type },
            body: values.image,
          });

          if (!uploadResult.ok) {
            throw new Error(`圖片上傳失敗：${uploadResult.status}`);
          }

          const json = await uploadResult.json();
          storageId = json.storageId as Id<"_storage">;

          // 呼叫 Server Action（有上傳圖片）
          await createPostAction({
            title: values.title,
            content: values.content,
            imageStorageId: storageId,
          });
        } else {
          // 呼叫 Server Action（無上傳圖片）
          await createPostAction({
            title: values.title,
            content: values.content,
          });
        }

        toast.add({
          type: "success",
          description: "成功建立貼文 !",
        });

        router.push("/blog");
      } catch (error) {
        console.error("建立貼文失敗:", error);
        toast.add({
          type: "error",
          description: "用戶未登入，無法建立貼文 !",
          priority: "high",
        });
      }
    });
  }

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Create Post
        </h1>
        <p className="text-xl text-muted-foreground mt-4">
          Share your thoughts with the big world
        </p>
      </div>

      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>建立一篇部落格文章</CardTitle>
          <CardDescription>您可以使用 MarkDown 格式編寫文章</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="gap-y-4">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="title">文章標題</FieldLabel>
                    <Input
                      id="title"
                      aria-invalid={fieldState.invalid}
                      placeholder="super cool title"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="content"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="textarea-content">文章內容</FieldLabel>
                    <Tabs defaultValue="overview">
                      <TabsList>
                        <TabsTrigger value="edit">
                          <SquarePen />
                          編輯
                        </TabsTrigger>
                        <TabsTrigger value="preview">
                          <AppWindowIcon />
                          預覽
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="edit">
                        <Textarea
                          id="textarea-content"
                          aria-invalid={fieldState.invalid}
                          placeholder="super cool blog content"
                          className="min-h-60"
                          {...field}
                        />
                      </TabsContent>
                      <TabsContent value="preview">
                        <MarkDownRender markdown={field.value} />
                      </TabsContent>
                    </Tabs>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="image"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>封面圖</FieldLabel>
                    <Input
                      aria-invalid={fieldState.invalid}
                      placeholder="upload image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file);
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Button type="submit" disabled={isPending} className="text-lg">
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Post</span>
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
