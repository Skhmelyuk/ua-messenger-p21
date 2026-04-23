import { mutation, query, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./users";
import { Id } from "./_generated/dataModel";

const STORY_DURATION_MS = 24 * 60 * 60 * 1000;

export const generateUploadUrl = mutation(async (ctx: MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return await ctx.storage.generateUploadUrl();
});

export const createStory = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) throw new Error("Image URL not found");

    return await ctx.db.insert("stories", {
      userId: currentUser._id,
      imageUrl,
      storageId: args.storageId,
      expiresAt: Date.now() + STORY_DURATION_MS,
      views: 0,
    });
  },
});

export const getActiveStories = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const now = Date.now();

    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", currentUser._id))
      .collect();

    const userIds: Id<"users">[] = [
      currentUser._id,
      ...follows.map((f) => f.followingId),
    ];

    const storiesWithUsers = await Promise.all(
      userIds.map(async (userId) => {
        const user = await ctx.db.get(userId);
        const userStories = await ctx.db
          .query("stories")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .filter((q) => q.gt(q.field("expiresAt"), now))
          .collect();

        return {
          user,
          stories: userStories,
          hasStory: userStories.length > 0,
        };
      }),
    );

    return storiesWithUsers.filter((s) => s.user !== null);
  },
});

export const getStoriesByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db
      .query("stories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .collect();
  },
});

export const incrementViews = mutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const story = await ctx.db.get(args.storyId);
    if (!story) throw new Error("Story not found");
    await ctx.db.patch(args.storyId, { views: story.views + 1 });
  },
});
