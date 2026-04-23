import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./users";
import { internal } from "./_generated/api";

export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const like = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId),
      )
      .first();

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (like) {
      await ctx.db.delete(like._id);
      await ctx.db.patch(post._id, { likes: post.likes - 1 });
      return false; // unliked
    } else {
      await ctx.db.insert("likes", {
        userId: currentUser._id,
        postId: args.postId,
      });
      await ctx.db.patch(post._id, { likes: post.likes + 1 });

      if (currentUser._id !== post.userId) {
        await ctx.db.insert("notifications", {
          type: "like",
          receiverId: post.userId,
          senderId: currentUser._id,
          postId: args.postId,
        });

        // Відправка push-сповіщення
        const receiver = await ctx.db.get(post.userId);
        if (receiver?.pushToken) {
          await ctx.scheduler.runAfter(
            0,
            internal.pushNotifications.sendPushNotification,
            {
              pushToken: receiver.pushToken,
              title: "Новий лайк ❤️",
              body: `${currentUser.username} вподобав ваш пост`,
              data: { postId: args.postId },
            },
          );
        }
      }

      return true; // liked
    }
  },
});
