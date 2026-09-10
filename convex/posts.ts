import { mutation, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { authComponent } from './auth';
import { Doc, Id } from './_generated/dataModel';
import { filter } from 'convex-helpers/server/filter';

export const createPost = mutation({
  args: { title: v.string(), body: v.string(), imageStorageId: v.optional(v.id('_storage')) },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError('Not Authenticated');
    }

    const blogArticle = await ctx.db.insert('posts', {
      title: args.title,
      body: args.body,
      authorId: user._id,
      imageStorageId: args.imageStorageId,
    });

    return blogArticle;
  },
});

export const getPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query('posts').order('desc').collect();

    return Promise.all(
      posts.map(async (post) => ({
        ...post,
        imageUrl:
          post.imageStorageId !== undefined ? await ctx.storage.getUrl(post.imageStorageId) : null,
      })),
    );
  },
});

export const generateImageUpload = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);

    if (!user) {
      throw new ConvexError('用戶未登入 !');
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const getPostById = query({
  args: { postId: v.id('posts') },
  handler: async (ctx, args) => {
    const post = await ctx.db.get('posts', args.postId);

    if (!post) return null;

    const resolvedImageUrl =
      post.imageStorageId !== undefined ? await ctx.storage.getUrl(post.imageStorageId) : null;

    return {
      ...post,
      imageUrl: resolvedImageUrl,
    };
  },
});

export interface searchResultTypes {
  _id: string;
  title: string;
  body: string;
}

export const searchPosts = query({
  args: {
    term: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const limit = args.limit;

    const results: searchResultTypes[] = [];

    const seen = new Set<Id<'posts'>>();

    const termHasChinese = /[\u4e00-\u9fa5]/.test(args.term);

    const safeTerm = args.term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const pushDocs = (docs: Doc<'posts'>[]) => {
      for (const doc of docs) {
        if (seen.has(doc._id)) continue;

        seen.add(doc._id);
        results.push({
          _id: doc._id,
          title: doc.title,
          body: doc.body,
        });
        if (results.length >= limit) break;
      }
    };

    const search = (index: 'search_title' | 'search_body', field: 'title' | 'body') => {
      if (termHasChinese) {
        return filter(ctx.db.query('posts'), (post) =>
          post[field].toLowerCase().includes(safeTerm.toLowerCase()),
        ).take(limit);
      }

      return ctx.db
        .query('posts')
        .withSearchIndex(index, (q) => q.search(field, args.term.trim()))
        .take(limit);
    };

    // 1. 優先搜尋標題
    const titleMatches = await search('search_title', 'title');
    pushDocs(titleMatches);

    // 2. 標題結果不足，再搜尋內容
    if (results.length < limit) {
      const bodyMatches = await search('search_body', 'body');
      pushDocs(bodyMatches);
    }

    return results;
  },
});
