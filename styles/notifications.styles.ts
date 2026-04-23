import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export const styles = StyleSheet.create({
  // Контейнер
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "JetBrainsMono-Medium",
    color: COLORS.primary,
  },

  // List
  listContainer: {
    padding: 16,
  },

  // Notification Item
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  notificationContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },

  // Avatar
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },

  // Icon Badge
  iconBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.surface,
  },

  // Notification Info
  notificationInfo: {
    flex: 1,
  },
  username: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  action: {
    color: COLORS.grey,
    fontSize: 14,
    marginBottom: 2,
  },
  timeAgo: {
    color: COLORS.grey,
    fontSize: 12,
  },

  // Post Image
  postImage: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },

  // Centered (for empty state)
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Swipe to delete
  swipeContainer: {
    position: "relative",
    marginBottom: 20,
  },
  swipeContent: {
    backgroundColor: COLORS.background,
  },
  deleteButton: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  deleteText: {
    color: COLORS.white,
    fontSize: 12,
    marginTop: 4,
  },
});
