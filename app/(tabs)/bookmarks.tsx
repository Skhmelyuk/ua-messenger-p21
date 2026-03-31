import { View, Text, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { Loader } from "@/components/Loader";
import NoBookmarksFound from "@/components/NoBookmarksFound";

export default function ScreenBookmarks() {
  // Перевірка автентифікації
  const { isAuthenticated } = useConvexAuth();

  // Завантаження закладок
  const bookmarkedPosts = useQuery(
    api.bookmarks.getBookmarkedPosts,
    isAuthenticated ? {} : "skip",
  );

  if (bookmarkedPosts === undefined) return <Loader />;

  if (bookmarkedPosts.length === 0) return <NoBookmarksFound />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 8,
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {bookmarkedPosts.map((post) => {
          if (!post) return null;
          return (
            <View key={post._id} style={{ width: "33.33%", padding: 1 }}>
              <Image
                source={post.imageUrl}
                style={{ width: "100%", aspectRatio: 1 }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
