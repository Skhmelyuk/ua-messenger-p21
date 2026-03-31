import { query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const getNotifications = query({
  handler: async (ctx) => {
    // 1. Отримання поточного користувача
    const currentUser = await getAuthenticatedUser(ctx);

    // 2. Отримання всіх сповіщень для користувача
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_receiver", (q) => q.eq("receiverId", currentUser._id))
      .order("desc")
      .collect();

    // 3. Збагачення даними
    const notificationsWithInfo = await Promise.all(
      notifications.map(async (notification) => {
        // Отримання відправника
        const sender = (await ctx.db.get(notification.senderId))!;

        // Отримання посту (якщо є)
        let post = null;
        if (notification.postId) {
          post = await ctx.db.get(notification.postId);
        }

        // Отримання коментаря (якщо тип = comment)
        let comment = null;
        if (notification.type === "comment" && notification.commentId) {
          comment = await ctx.db.get(notification.commentId);
        }

        return {
          ...notification,
          sender: {
            _id: sender._id,
            username: sender.username,
            image: sender.image,
          },
          post,
          comment: comment?.content,
        };
      }),
    );

    return notificationsWithInfo;
  },
});
