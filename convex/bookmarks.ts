import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const toggleBookmark = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // 1. Отримання поточного користувача
    const currentUser = await getAuthenticatedUser(ctx);

    // 2. Перевірка чи вже є закладка
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_both", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId),
      )
      .first();

    // 3. Toggle логіка
    if (existing) {
      // Видаляємо закладку
      await ctx.db.delete(existing._id);
      return false; // unbookmarked
    } else {
      // Додаємо закладку
      await ctx.db.insert("bookmarks", {
        userId: currentUser._id,
        postId: args.postId,
      });
      return true; // bookmarked
    }
  },
});

export const getBookmarkedPosts = query({
  handler: async (ctx) => {
    // 1. Отримання поточного користувача
    const currentUser = await getAuthenticatedUser(ctx);

    // 2. Отримання всіх закладок користувача
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .order("desc")
      .collect();

    // 3. Отримання постів
    const bookmarksWithInfo = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const post = await ctx.db.get(bookmark.postId);
        return post;
      }),
    );

    return bookmarksWithInfo;
  },
});

export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // 1. Отримання поточного користувача
    const currentUser = await getAuthenticatedUser(ctx);

    // 2. Отримання посту
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // 3. Перевірка власника
    if (post.userId !== currentUser._id) {
      throw new Error("Not authorized to delete this post");
    }

    // 4. Видалення пов'язаних лайків
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    // 5. Видалення пов'язаних коментарів
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // 6. Видалення пов'язаних закладок
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const bookmark of bookmarks) {
      await ctx.db.delete(bookmark._id);
    }

    // 7. Видалення файлу зі Storage
    await ctx.storage.delete(post.storageId);

    // 8. Видалення посту
    await ctx.db.delete(args.postId);

    // 9. Зменшення лічильника постів користувача
    await ctx.db.patch(currentUser._id, {
      posts: Math.max(0, (currentUser.posts || 1) - 1),
    });
  },
});
