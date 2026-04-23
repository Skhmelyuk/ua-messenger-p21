import { View, Text, FlatList } from "react-native";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/notifications.styles";
import { Loader } from "@/components/Loader";
import NoNotificationsFound from "@/components/NoNotificationsFound";
import { SwipeableNotificationItem } from "@/components/SwipeableNotificationItem";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function ScreenNotifications() {
  const { isAuthenticated } = useConvexAuth();

  const notifications = useQuery(
    api.notifications.getNotifications,
    isAuthenticated ? {} : "skip",
  );

  const deleteNotification = useMutation(api.notifications.deleteNotification);

  const handleDeleteNotification = async (
    notificationId: Id<"notifications">,
  ) => {
    try {
      await deleteNotification({ notificationId });
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  if (notifications === undefined) return <Loader />;

  if (notifications.length === 0) return <NoNotificationsFound />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        {/* NOTIFICATIONS LIST */}
        <FlatList
          data={notifications}
          renderItem={({ item }) => (
            <SwipeableNotificationItem
              notification={item}
              onDelete={handleDeleteNotification}
            />
          )}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </GestureHandlerRootView>
  );
}
