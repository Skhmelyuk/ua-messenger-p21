# Групове завдання v6: Коментарі, закладки та видалення постів

## Опис завдання

Продовжити розробку мобільного додатку **X (Twitter) Clone**, додавши функціонал коментарів, закладок (bookmarks) та видалення постів.

---

## Що ми робили на уроці (і що потрібно повторити)

### ✅ Частина 1: Backend — Коментарі

- Створення `convex/comments.ts`
- Mutation `addComment` з notification
- Query `getComments` для отримання коментарів посту
- Індекс `by_post` в schema.ts

### ✅ Частина 2: UI — Компоненти коментарів

- Компонент `Comment` для відображення одного коментаря
- Компонент `CommentsModal` з FlatList та TextInput
- Інтеграція модального вікна в Post

### ✅ Частина 3: Backend — Закладки

- Створення `convex/bookmarks.ts`
- Mutation `toggleBookmark`
- Query `getBookmarkedPosts`
- Індекси для bookmarks в schema.ts

### ✅ Частина 4: Backend — Видалення посту

- Mutation `deletePost` в `convex/posts.ts`
- Каскадне видалення (likes, comments, bookmarks, storage)
- Query `getUserByClerkId` для перевірки власника

### ✅ Частина 5: Інтеграція в Post

- Оновлення компонента Post з усіма функціями
- Умовне відображення кнопки видалення

---

## Формат роботи

|                             |                                  |
| --------------------------- | -------------------------------- |
| **Тип завдання**            | Групове                          |
| **Розмір команди**          | 4 особи                          |
| **Система контролю версій** | GitHub                           |
| **Методологія**             | Feature branches + Pull Requests |

---

## Розподіл ролей у команді

### 👨‍💼 Team Lead / Comments Backend Developer

**Що робить (як на уроці):**

- Створює `convex/comments.ts`
- Реалізує `addComment` mutation
- Реалізує `getComments` query
- Додає індекс в schema.ts
- Координує роботу команди
- Мержить Pull Requests

**Файли:**

- `convex/comments.ts`
- `convex/schema.ts`

---

### 🔖 Bookmarks Backend Developer

**Що робить (як на уроці):**

- Створює `convex/bookmarks.ts`
- Реалізує `toggleBookmark` mutation
- Реалізує `getBookmarkedPosts` query
- Додає індекси в schema.ts

**Файли:**

- `convex/bookmarks.ts`
- `convex/schema.ts`

---

### 🗑️ Delete & Users Backend Developer

**Що робить (як на уроці):**

- Додає `deletePost` mutation в `convex/posts.ts`
- Додає `getUserByClerkId` query в `convex/users.ts`
- Додає індекс `by_post` для likes

**Файли:**

- `convex/posts.ts`
- `convex/users.ts`
- `convex/schema.ts`

---

### 📦 UI Components Developer

**Що робить (як на уроці):**

- Створює `components/Comment.tsx`
- Створює `components/CommentsModal.tsx`
- Оновлює `components/Post.tsx` з усіма функціями

**Файли:**

- `components/Comment.tsx`
- `components/CommentsModal.tsx`
- `components/Post.tsx`

---

## Робота з GitHub

### Крок 1: Оновити локальний репозиторій

```bash
cd x-clone
git checkout main
git pull origin main
```

### Крок 2: Створити нові гілки

```bash
# Team Lead / Comments Backend
git checkout -b feature/comments-backend

# Bookmarks Backend Developer
git checkout -b feature/bookmarks-backend

# Delete & Users Backend Developer
git checkout -b feature/delete-post

# UI Components Developer
git checkout -b feature/comments-ui
```

### Крок 3: Після завершення роботи

```bash
git add .
git commit -m "feat: add comments, bookmarks and delete functionality"
git push origin feature/comments-backend
```

### Крок 4: Pull Request

1. Створити PR на GitHub
2. Team Lead робить review та merge

---

## Порядок виконання

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Паралельна робота                                │
├─────────────────┬─────────────────┬─────────────────┬───────────────┤
│  Team Lead      │ Bookmarks Dev   │ Delete Dev      │ UI Components │
│  (Comments)     │                 │                 │ Developer     │
│                 │                 │                 │               │
│  • comments.ts  │  • bookmarks.ts │  • deletePost   │  • Comment.   │
│  • addComment   │  • toggle-      │  • getUserBy-   │    tsx        │
│  • getComments  │    Bookmark     │    ClerkId      │  • Comments-  │
│  • schema       │  • getBookmark- │  • likes index  │    Modal.tsx  │
│    index        │    edPosts      │                 │  • Post.tsx   │
│                 │  • schema       │                 │    (updated)  │
│                 │    indexes      │                 │               │
└─────────────────┴─────────────────┴─────────────────┴───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Інтеграція                                  │
│              Team Lead мержить всі гілки                            │
│              Команда тестує коментарі, закладки, видалення          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Що має працювати в кінці

### ✅ Обов'язково:

1. **Коментарі** — можна додати коментар до посту
2. **Модальне вікно** — відкривається при натисканні на іконку коментаря
3. **Список коментарів** — відображається в модальному вікні
4. **Лічильник коментарів** — оновлюється при додаванні
5. **Закладки** — можна зберегти/видалити пост з закладок
6. **Іконка закладки** — змінює колір при збереженні
7. **Видалення посту** — працює тільки для власних постів
8. **Каскадне видалення** — видаляються лайки, коментарі, закладки
9. **Notification** — створюється при коментарі чужого посту
10. **Умовна кнопка** — trash для власних, ellipsis для чужих постів

---

## Структура проєкту (оновлена)

```
x-clone/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   └── login.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── create.tsx
│       ├── notifications.tsx
│       └── profile.tsx
├── components/
│   ├── InitialLayout.tsx
│   ├── Story.tsx
│   ├── Post.tsx                 # ОНОВЛЕНИЙ
│   ├── Loader.tsx
│   ├── StoriesSection.tsx
│   ├── Comment.tsx              # НОВИЙ ФАЙЛ
│   └── CommentsModal.tsx        # НОВИЙ ФАЙЛ
├── providers/
│   └── ClerkAndConvexProvider.tsx
├── constants/
│   ├── theme.ts
│   └── mock-data.ts
├── styles/
│   ├── auth.styles.ts
│   ├── create.styles.ts
│   └── feed.styles.ts
├── convex/
│   ├── auth.config.ts
│   ├── schema.ts                # ОНОВЛЕНИЙ (нові індекси)
│   ├── users.ts                 # ОНОВЛЕНИЙ (getUserByClerkId)
│   ├── http.ts
│   ├── posts.ts                 # ОНОВЛЕНИЙ (deletePost)
│   ├── comments.ts              # НОВИЙ ФАЙЛ
│   └── bookmarks.ts             # НОВИЙ ФАЙЛ
├── assets/
│   ├── images/
│   └── fonts/
└── .env
```

---

## Критерії оцінювання

### Оцінка команди (спільна)

| Критерій                                  | Бали    |
| ----------------------------------------- | ------- |
| **Backend: Коментарі**                    |         |
| `addComment` mutation працює              | 10      |
| `getComments` query працює                | 10      |
| Notification створюється при коментарі    | 5       |
| Індекс `by_post` для comments             | 5       |
| **Backend: Закладки**                     |         |
| `toggleBookmark` mutation працює          | 10      |
| `getBookmarkedPosts` query працює         | 5       |
| Індекси для bookmarks                     | 5       |
| **Backend: Видалення**                    |         |
| `deletePost` mutation працює              | 10      |
| Каскадне видалення (likes, comments)      | 10      |
| `getUserByClerkId` query працює           | 5       |
| **UI Components**                         |         |
| `Comment` компонент створено              | 5       |
| `CommentsModal` компонент створено        | 10      |
| Модальне вікно відкривається/закривається | 5       |
| Закладка змінює іконку                    | 5       |
| Умовна кнопка видалення                   | 5       |
| **Всього**                                | **105** |

> **Примітка:** Максимум 100 балів. Додаткові 5 балів — бонус за якість.

### Оцінка роботи з GitHub (обов'язково)

| Критерій                     | Так/Ні |
| ---------------------------- | ------ |
| Використано feature branches | ☐      |
| Є Pull Requests              | ☐      |
| Коміти мають зрозумілі назви | ☐      |

> Якщо GitHub не використано — **мінус 20 балів**

---

## Тестування

### Як перевірити, що все працює:

1. **Запустити додаток** — `npm start`
2. **Увійти** через Google OAuth
3. **Натиснути на іконку коментаря** — має відкритись модальне вікно
4. **Написати коментар** — натиснути Post
5. **Перевірити лічильник** — кількість коментарів має збільшитись
6. **Натиснути на закладку** — іконка має змінитись
7. **Створити пост** — має з'явитись кнопка видалення (trash)
8. **Видалити пост** — пост має зникнути зі списку
9. **Перевірити Convex Dashboard** — таблиці comments, bookmarks, notifications

### Можливі помилки:

| Помилка                         | Причина                       | Рішення                                |
| ------------------------------- | ----------------------------- | -------------------------------------- |
| `Post not found`                | Невірний postId               | Перевірте що пост існує                |
| `Not authorized`                | Спроба видалити чужий пост    | Перевірте currentUser.\_id             |
| Модальне вікно не відкривається | showComments не змінюється    | Перевірте setShowComments              |
| Коментарі не з'являються        | getComments не працює         | Перевірте індекс by_post               |
| Закладка не працює              | toggleBookmark не імпортовано | Перевірте api.bookmarks.toggleBookmark |
| `Cannot read property of null`  | Індекс не створений           | Додайте індекс в schema.ts             |

---

## Чек-лист перед здачею

### Team Lead / Comments Backend Developer

- [ ] `convex/comments.ts` створено
- [ ] `addComment` mutation працює
- [ ] `getComments` query працює
- [ ] Індекс `by_post` додано в schema.ts
- [ ] Notification створюється при коментарі
- [ ] Всі гілки змержені в `main`

### Bookmarks Backend Developer

- [ ] `convex/bookmarks.ts` створено
- [ ] `toggleBookmark` mutation працює
- [ ] `getBookmarkedPosts` query працює
- [ ] Індекси `by_user`, `by_user_and_post`, `by_post` додано

### Delete & Users Backend Developer

- [ ] `deletePost` mutation додано в `convex/posts.ts`
- [ ] Каскадне видалення працює (likes, comments, bookmarks)
- [ ] `getUserByClerkId` query додано в `convex/users.ts`
- [ ] Індекс `by_post` для likes додано

### UI Components Developer

- [ ] `components/Comment.tsx` створено
- [ ] `components/CommentsModal.tsx` створено
- [ ] Модальне вікно відкривається/закривається
- [ ] Коментарі відображаються в FlatList
- [ ] Input для нового коментаря працює
- [ ] Закладка змінює іконку
- [ ] Кнопка видалення відображається тільки для власних постів

---

## Здача роботи

### Що потрібно здати:

1. **Посилання на GitHub репозиторій**
2. **Скріншот** модального вікна з коментарями
3. **Скріншот** посту з активною закладкою
4. **Скріншот** таблиці `comments` в Convex Dashboard
5. **Відео** (опціонально) — демонстрація додавання коментаря та видалення посту

### Формат здачі:

```
Команда: [Назва команди]
Репозиторій: https://github.com/[username]/x-clone

Учасники:
- [Ім'я] — Team Lead / Comments Backend Developer
- [Ім'я] — Bookmarks Backend Developer
- [Ім'я] — Delete & Users Backend Developer
- [Ім'я] — UI Components Developer

Скріншоти:
- CommentsModal: [посилання]
- Bookmark: [посилання]
- Comments table: [посилання]
```

---

## Діаграма потоку коментаря

```
┌──────────────────────────────────────────────────────────────────┐
│                 Користувач натискає 💬                            │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  1. setShowComments(true)                                         │
│     └─► Відкривається CommentsModal                              │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  2. useQuery(api.comments.getComments, { postId })               │
│     └─► Завантажуються існуючі коментарі                         │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  3. Користувач вводить текст та натискає Post                    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  4. handleAddComment()                                            │
│     └─► addComment({ content, postId })                          │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  5. Convex Server:                                                │
│     ├─► insert("comments", { userId, postId, content })          │
│     ├─► patch(postId, { comments: comments + 1 })                │
│     └─► insert("notifications", { type: "comment", ... })        │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  6. UI оновлюється автоматично (realtime)                        │
│     ├─► Новий коментар з'являється в FlatList                    │
│     └─► onCommentsAdd() → setCommentsCount(count + 1)            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Діаграма каскадного видалення

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
│  2. Видалення пов'язаних даних:                                  │
│     ├─► for (like of likes) → delete(like._id)                   │
│     ├─► for (comment of comments) → delete(comment._id)          │
│     └─► for (bookmark of bookmarks) → delete(bookmark._id)       │
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
│  4. Видалення посту                                              │
│     └─► ctx.db.delete(args.postId)                               │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  5. Оновлення лічильника постів користувача                      │
│     └─► patch(currentUser._id, { posts: posts - 1 })             │
└──────────────────────────────────────────────────────────────────┘
```

---

## Корисні ресурси

### Документація

- [Convex Mutations](https://docs.convex.dev/functions/mutation-functions)
- [Convex Queries](https://docs.convex.dev/functions/query-functions)
- [React Native Modal](https://reactnative.dev/docs/modal)
- [React Native KeyboardAvoidingView](https://reactnative.dev/docs/keyboardavoidingview)
- [Clerk useUser](https://clerk.com/docs/references/react/use-user)

### Корисні концепції

- **Каскадне видалення** — видалення всіх пов'язаних записів перед видаленням основного
- **Conditional rendering** — умовне відображення елементів
- **Modal** — модальне вікно поверх основного контенту
- **KeyboardAvoidingView** — автоматичне зміщення контенту при відкритті клавіатури

---

## Питання?

Якщо виникли питання — звертайтесь до викладача або в чат групи.

**Успіхів команді!** 🚀
