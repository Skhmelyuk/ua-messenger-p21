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
