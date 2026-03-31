import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/notifications.styles";
import { Loader } from "@/components/Loader";
import NoNotificationsFound from "@/components/NoNotificationsFound";
import { NotificationItem } from "@/components/NotificationItem";

export default function ScreenNotifications() {
  // Перевірка автентифікації
  const { isAuthenticated } = useConvexAuth();

  // Отримання сповіщень
  const notifications = useQuery(
    api.notifications.getNotifications,
    isAuthenticated ? {} : "skip",
  );

  // Loading state
  if (notifications === undefined) return <Loader />;

  // Empty state
  if (notifications.length === 0) return <NoNotificationsFound />;
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* NOTIFICATIONS LIST */}
      <FlatList
        data={notifications}
        renderItem={({ item }) => <NotificationItem notification={item} />}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}
