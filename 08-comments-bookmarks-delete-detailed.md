# Інструкція 8: Коментарі, закладки та видалення постів

Покрокова інструкція з додавання функціоналу коментарів, закладок (bookmarks) та видалення постів.

---

## Зміст

1. [Огляд архітектури](#огляд-архітектури)
2. [Backend: Коментарі](#backend-коментарі)
3. [Компонент Comment](#компонент-comment)
4. [Компонент CommentsModal](#компонент-commentsmodal)
5. [Backend: Закладки](#backend-закладки)
6. [Backend: Видалення посту](#backend-видалення-посту)
7. [Оновлення компонента Post](#оновлення-компонента-post)
8. [Інтеграція всіх функцій](#інтеграція-всіх-функцій)

---

## Огляд архітектури

### Нові функції, які додаємо

```
┌─────────────────────────────────────────────────────────────────────┐
│                    POST INTERACTIONS v2                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │    COMMENTS     │  │    BOOKMARKS    │  │     DELETE      │     │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │     │
│  │  │ addComment│  │  │  │ toggle-   │  │  │  │ deletePost│  │     │
│  │  │ getComments│ │  │  │ Bookmark  │  │  │  │           │  │     │
│  │  └───────────┘  │  │  │ getBook-  │  │  │  └───────────┘  │     │
│  │                 │  │  │ markedPosts│ │  │                 │     │
│  └─────────────────┘  │  └───────────┘  │  └─────────────────┘     │
│          │            └─────────────────┘           │               │
│          ▼                     │                    ▼               │
│  ┌─────────────────────────────┴────────────────────────────────┐  │
│  │                    NOTIFICATIONS                              │  │
│  │              (при коментарі чужого посту)                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Файли, які створюємо/модифікуємо

| Файл                           | Призначення                       |
| ------------------------------ | --------------------------------- |
| `convex/comments.ts`           | Mutations/Queries для коментарів  |
| `convex/bookmarks.ts`          | Mutations/Queries для закладок    |
| `convex/posts.ts`              | Mutation `deletePost`             |
| `convex/users.ts`              | Query `getUserByClerkId`          |
| `convex/schema.ts`             | Індекси для comments та bookmarks |
| `components/Comment.tsx`       | Компонент одного коментаря        |
| `components/CommentsModal.tsx` | Модальне вікно коментарів         |
| `components/Post.tsx`          | Інтеграція всіх функцій           |

### Потік даних коментарів

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User types  │ ──► │  addComment  │ ──► │  Insert to   │
│  comment     │     │  mutation    │     │  comments DB │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  UI updates  │ ◄── │  getComments │ ◄── │  Realtime    │
│  (FlatList)  │     │  query       │     │  subscription│
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## Backend: Коментарі

### Файл: `convex/comments.ts`

Створюємо новий файл для роботи з коментарями.

### Імпорти

```typescript
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";
```

### Пояснення імпортів

| Імпорт                 | Призначення                                   |
| ---------------------- | --------------------------------------------- |
| `ConvexError`          | Кастомні помилки з зрозумілими повідомленнями |
| `v`                    | Валідатори для аргументів                     |
| `mutation`             | Функція для запису даних                      |
| `query`                | Функція для читання даних                     |
| `getAuthenticatedUser` | Утиліта для перевірки автентифікації          |

---

### Mutation: addComment

```typescript
export const addComment = mutation({
  args: {
    content: v.string(), // Текст коментаря
    postId: v.id("posts"), // ID посту
  },
  handler: async (ctx, args) => {
    // 1. Отримання поточного користувача
    const currentUser = await getAuthenticatedUser(ctx);

    // 2. Перевірка існування посту
    const post = await ctx.db.get(args.postId);
    if (!post) throw new ConvexError("Post not found");

    // 3. Створення коментаря
    const commentId = await ctx.db.insert("comments", {
      userId: currentUser._id,
      postId: args.postId,
      content: args.content,
    });

    // 4. Оновлення лічильника коментарів посту
    await ctx.db.patch(args.postId, {
      comments: post.comments + 1,
    });

    // 5. Створення notification (якщо не свій пост)
    if (post.userId !== currentUser._id) {
      await ctx.db.insert("notifications", {
        receiverId: post.userId,
        senderId: currentUser._id,
        type: "comment",
        postId: args.postId,
        commentId,
      });
    }

    return commentId;
  },
});
```

### Діаграма логіки addComment

```
┌──────────────────────────────────────────────────────────────────┐
│                    addComment(content, postId)                    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  1. getAuthenticatedUser() — перевірка авторизації               │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  2. Перевірка існування посту                                    │
│     └─► Якщо не існує → throw ConvexError("Post not found")      │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  3. insert("comments", { userId, postId, content })              │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  4. patch(postId, { comments: comments + 1 })                    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  5. Чи це чужий пост?                                            │
│     └─► Так → insert("notifications", { type: "comment", ... })  │
│     └─► Ні → пропускаємо                                         │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  6. return commentId                                              │
└──────────────────────────────────────────────────────────────────┘
```

---

### Query: getComments

```typescript
export const getComments = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // 1. Отримання всіх коментарів посту
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    // 2. Збагачення даними користувача
    const commentsWithInfo = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user: {
            fullname: user!.fullname,
            image: user!.image,
          },
        };
      }),
    );

    return commentsWithInfo;
  },
});
```

### Пояснення getComments

| Крок                        | Опис                                              |
| --------------------------- | ------------------------------------------------- |
| `withIndex("by_post", ...)` | Використовуємо індекс для швидкого пошуку         |
| `Promise.all()`             | Паралельне отримання даних користувачів           |
| `user!.fullname`            | Non-null assertion (користувач гарантовано існує) |

---

### Необхідний індекс в schema.ts

```typescript
comments: defineTable({
  userId: v.id("users"),
  postId: v.id("posts"),
  content: v.string(),
}).index("by_post", ["postId"]),
```

### Структура повернених даних

```typescript
type CommentWithInfo = {
  _id: Id<"comments">;
  userId: Id<"users">;
  postId: Id<"posts">;
  content: string;
  _creationTime: number;
  user: {
    fullname: string;
    image: string;
  };
};
```

---

## Компонент Comment

### Файл: `components/Comment.tsx`

Створюємо компонент для відображення одного коментаря.

```typescript
import { View, Text, Image } from "react-native";
import { styles } from "@/styles/feed.styles";
import { formatDistanceToNow } from "date-fns";

// Типізація пропсів
interface CommentProps {
  content: string;
  _creationTime: number;
  user: {
    fullname: string;
    image: string;
  };
}

export function Comment({ comment }: { comment: CommentProps }) {
  return (
    <View style={styles.commentContainer}>
      {/* Аватар користувача */}
      <Image
        source={{ uri: comment.user.image }}
        style={styles.commentAvatar}
      />

      {/* Контент коментаря */}
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{comment.user.fullname}</Text>
        <Text style={styles.commentText}>{comment.content}</Text>
        <Text style={styles.commentTime}>
          {formatDistanceToNow(comment._creationTime, { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
}
```

### Структура компонента Comment

```
┌─────────────────────────────────────────────────────────────┐
│  ┌────────┐  ┌─────────────────────────────────────────┐   │
│  │        │  │  John Doe                               │   │
│  │ Avatar │  │  This is a great post! 👍               │   │
│  │        │  │  5 minutes ago                          │   │
│  └────────┘  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Компонент CommentsModal

### Файл: `components/CommentsModal.tsx`

Створюємо модальне вікно для відображення та додавання коментарів.

### Імпорти

```typescript
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/feed.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { Loader } from "./Loader";
import { Comment } from "./Comment";
```

### Типізація пропсів

```typescript
type CommentsModalProps = {
  postId: Id<"posts">; // ID посту
  visible: boolean; // Чи відкрите модальне вікно
  onClose: () => void; // Callback закриття
  onCommentsAdd: () => void; // Callback після додавання коментаря
};
```

### Основний компонент

```typescript
export function CommentsModal({
  onClose,
  onCommentsAdd,
  postId,
  visible,
}: CommentsModalProps) {
  // Локальний стан для нового коментаря
  const [newComment, setNewComment] = useState("");

  // Отримання коментарів (реактивне)
  const comments = useQuery(api.comments.getComments, { postId });

  // Mutation для додавання коментаря
  const addComment = useMutation(api.comments.addComment);

  // Handler додавання коментаря
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment({
        content: newComment,
        postId,
      });
      setNewComment("");
      onCommentsAdd(); // Оновлюємо лічильник в Post
    } catch (error) {
      console.log("Error adding comment:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Comments</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Comments List */}
        {comments === undefined ? (
          <Loader />
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <Comment comment={item} />}
            contentContainerStyle={styles.commentsList}
          />
        )}

        {/* Input */}
        <View style={styles.commentInput}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor={COLORS.grey}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Text
              style={[
                styles.postButton,
                !newComment.trim() && styles.postButtonDisabled,
              ]}
            >
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
```

### Структура CommentsModal

```
┌─────────────────────────────────────────────────────────────┐
│  [X]              Comments                      [   ]       │  ← Header
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Avatar] John Doe                                  │   │
│  │           Great post!                               │   │
│  │           5 minutes ago                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │  ← FlatList
│  │  [Avatar] Jane Smith                                │   │
│  │           I agree! 👍                               │   │
│  │           2 minutes ago                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Add a comment...                          ] [Post]        │  ← Input
└─────────────────────────────────────────────────────────────┘
```

### Пояснення KeyboardAvoidingView

| Platform | Behavior    | Опис                                         |
| -------- | ----------- | -------------------------------------------- |
| iOS      | `"padding"` | Додає padding знизу при відкритті клавіатури |
| Android  | `"height"`  | Змінює висоту контейнера                     |

---

## Backend: Закладки

### Файл: `convex/bookmarks.ts`

Створюємо новий файл для роботи з закладками.

### Імпорти

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";
```

### Mutation: toggleBookmark

```typescript
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
```

### Query: getBookmarkedPosts

```typescript
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
```

### Необхідні індекси в schema.ts

```typescript
bookmarks: defineTable({
  userId: v.id("users"),
  postId: v.id("posts"),
})
  .index("by_user", ["userId"])
  .index("by_user_and_post", ["userId", "postId"])
  .index("by_post", ["postId"]),
```

### Діаграма toggleBookmark

```
┌──────────────────────────────────────────────────────────────────┐
│                    toggleBookmark(postId)                         │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Чи існує запис в таблиці "bookmarks"?                           │
│  (userId + postId)                                                │
└──────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────┐           ┌─────────────────────┐
│     ІСНУЄ           │           │   НЕ ІСНУЄ          │
├─────────────────────┤           ├─────────────────────┤
│ • delete(existing)  │           │ • insert("bookmarks")│
│ • return false      │           │ • return true       │
│   (unbookmarked)    │           │   (bookmarked)      │
└─────────────────────┘           └─────────────────────┘
```

---

## Backend: Видалення посту

### Файл: `convex/posts.ts`

Додаємо mutation для видалення посту.

### Mutation: deletePost

```typescript
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
```

### Діаграма deletePost

```
┌──────────────────────────────────────────────────────────────────┐
│                      deletePost(postId)                           │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  1. Перевірка авторизації та власника                            │
│     └─► Якщо не власник → throw Error("Not authorized")          │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  2. Каскадне видалення пов'язаних даних                          │
│     ├─► Видалення всіх likes                                     │
│     ├─► Видалення всіх comments                                  │
│     └─► Видалення всіх bookmarks                                 │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  3. Видалення файлу зі Storage                                   │
│     └─► ctx.storage.delete(post.storageId)                       │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  4. Видалення посту з БД                                         │
│     └─► ctx.db.delete(args.postId)                               │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  5. Оновлення лічильника постів користувача                      │
│     └─► patch(currentUser._id, { posts: posts - 1 })             │
└──────────────────────────────────────────────────────────────────┘
```

### Необхідний індекс для likes

```typescript
likes: defineTable({
  userId: v.id("users"),
  postId: v.id("posts"),
})
  .index("by_user_and_post", ["userId", "postId"])
  .index("by_post", ["postId"]),
```

---

## Query: getUserByClerkId

### Файл: `convex/users.ts`

Додаємо query для отримання користувача за Clerk ID.

```typescript
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    return user;
  },
});
```

### Пояснення

| Метод         | Опис                                          |
| ------------- | --------------------------------------------- |
| `.unique()`   | Повертає один запис або null (замість масиву) |
| `by_clerk_id` | Індекс для швидкого пошуку за clerkId         |

---

## Оновлення компонента Post

### Файл: `components/Post.tsx`

Інтегруємо всі нові функції в компонент Post.

### Нові імпорти

```typescript
import { useUser } from "@clerk/expo";
import { CommentsModal } from "./CommentsModal";
```

### Новий стан

```typescript
export const Post = ({ post }: PostProps) => {
  // Існуючий стан
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);

  // Новий стан для коментарів
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);

  // Новий стан для закладок
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);

  // Отримання поточного користувача
  const { user } = useUser();
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip",
  );

  // Mutations
  const toggleLike = useMutation(api.posts.toggleLike);
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);
  const deletePost = useMutation(api.posts.deletePost);

  // ... handlers
};
```

### Handler для закладок

```typescript
const handleBookmark = async () => {
  try {
    const newIsBookmarked = await toggleBookmark({ postId: post._id });
    setIsBookmarked(newIsBookmarked);
  } catch (error) {
    console.error("Error toggling bookmark:", error);
  }
};
```

### Handler для видалення

```typescript
const handleDelete = async () => {
  try {
    await deletePost({ postId: post._id });
  } catch (error) {
    console.error("Error deleting post:", error);
  }
};
```

### Оновлений JSX для кнопки коментарів

```typescript
<TouchableOpacity onPress={() => setShowComments(true)}>
  <Ionicons
    name={commentsCount > 0 ? "chatbubble" : "chatbubble-outline"}
    size={22}
    color={commentsCount > 0 ? COLORS.primary : COLORS.white}
  />
</TouchableOpacity>
```

### Оновлений JSX для закладок

```typescript
<TouchableOpacity onPress={handleBookmark}>
  <Ionicons
    name={isBookmarked ? "bookmark" : "bookmark-outline"}
    size={22}
    color={isBookmarked ? COLORS.primary : COLORS.white}
  />
</TouchableOpacity>
```

### Умовне відображення кнопки видалення

```typescript
{post.author._id === currentUser?._id ? (
  <TouchableOpacity onPress={handleDelete}>
    <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
  </TouchableOpacity>
) : (
  <TouchableOpacity>
    <Ionicons
      name="ellipsis-horizontal-outline"
      size={20}
      color={COLORS.primary}
    />
  </TouchableOpacity>
)}
```

### Відображення кількості коментарів

```typescript
{commentsCount > 0 && (
  <TouchableOpacity onPress={() => setShowComments(true)}>
    <Text style={styles.commentsText}>
      View all {commentsCount} comments
    </Text>
  </TouchableOpacity>
)}
```

### CommentsModal в JSX

```typescript
<CommentsModal
  postId={post._id}
  visible={showComments}
  onClose={() => setShowComments(false)}
  onCommentsAdd={() => setCommentsCount(commentsCount + 1)}
/>
```

---

## Інтеграція всіх функцій

### Повний код Post.tsx

```typescript
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { styles } from "@/styles/feed.styles";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/expo";
import { CommentsModal } from "./CommentsModal";

type PostProps = {
  post: {
    _id: Id<"posts">;
    imageUrl: string;
    caption?: string;
    likes: number;
    comments: number;
    _creationTime: number;
    isLiked: boolean;
    isBookmarked: boolean;
    author: {
      _id: string;
      username: string;
      image: string;
    };
  };
};

export const Post = ({ post }: PostProps) => {
  // State
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);

  // Current user
  const { user } = useUser();
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  // Mutations
  const toggleLike = useMutation(api.likes.toggleLike);
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);
  const deletePost = useMutation(api.posts.deletePost);

  // Handlers
  const handleLike = async () => {
    try {
      const newIsLiked = await toggleLike({ postId: post._id });
      setIsLiked(newIsLiked);
      setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleBookmark = async () => {
    try {
      const newIsBookmarked = await toggleBookmark({ postId: post._id });
      setIsBookmarked(newIsBookmarked);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost({ postId: post._id });
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <View style={styles.post}>
      {/* HEADER */}
      <View style={styles.postHeader}>
        <Link href={`/(tabs)/notifications`}>
          <TouchableOpacity style={styles.postHeaderLeft}>
            <Image
              source={post.author.image}
              style={styles.postAvatar}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
            <Text style={styles.postUsername}>{post.author.username}</Text>
          </TouchableOpacity>
        </Link>

        {/* Delete or Menu button */}
        {post.author._id === currentUser?._id ? (
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-horizontal-outline"
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* IMAGE */}
      <Image
        source={post.imageUrl}
        style={styles.postImage}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
      />

      {/* ACTIONS */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          {/* Like */}
          <TouchableOpacity onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "#FF3B30" : COLORS.white}
            />
          </TouchableOpacity>

          {/* Comment */}
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Ionicons
              name={commentsCount > 0 ? "chatbubble" : "chatbubble-outline"}
              size={22}
              color={commentsCount > 0 ? COLORS.primary : COLORS.white}
            />
          </TouchableOpacity>
        </View>

        {/* Bookmark */}
        <TouchableOpacity onPress={handleBookmark}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color={isBookmarked ? COLORS.primary : COLORS.white}
          />
        </TouchableOpacity>
      </View>

      {/* POST INFO */}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {likesCount > 0
            ? `${likesCount.toLocaleString()} likes`
            : "Be the first to like"}
        </Text>

        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}

        {commentsCount > 0 && (
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Text style={styles.commentsText}>
              View all {commentsCount} comments
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.timeAgo}>
          {formatDistanceToNow(post._creationTime, { addSuffix: true })}
        </Text>
      </View>

      {/* Comments Modal */}
      <CommentsModal
        postId={post._id}
        visible={showComments}
        onClose={() => setShowComments(false)}
        onCommentsAdd={() => setCommentsCount(commentsCount + 1)}
      />
    </View>
  );
};
```

---

## Підсумок

### Що ми реалізували

| Функціонал             | Опис                               |
| ---------------------- | ---------------------------------- |
| **addComment**         | Додавання коментаря з notification |
| **getComments**        | Отримання коментарів посту         |
| **Comment**            | Компонент одного коментаря         |
| **CommentsModal**      | Модальне вікно коментарів          |
| **toggleBookmark**     | Toggle закладки                    |
| **getBookmarkedPosts** | Отримання збережених постів        |
| **deletePost**         | Каскадне видалення посту           |
| **getUserByClerkId**   | Отримання користувача за Clerk ID  |

### Оновлена схема бази даних

```typescript
// schema.ts
export default defineSchema({
  users: defineTable({
    // ...existing fields
  }).index("by_clerk_id", ["clerkId"]),

  posts: defineTable({
    // ...existing fields
  }),

  likes: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
  })
    .index("by_user_and_post", ["userId", "postId"])
    .index("by_post", ["postId"]),

  comments: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    content: v.string(),
  }).index("by_post", ["postId"]),

  bookmarks: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_post", ["userId", "postId"])
    .index("by_post", ["postId"]),

  notifications: defineTable({
    // ...existing fields
  }),
});
```

### Наступні кроки

- Реалізувати сторінку профілю
- Додати сторінку notifications
- Реалізувати пошук користувачів
- Додати follow/unfollow функціонал
