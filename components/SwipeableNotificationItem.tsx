import { View, Text, Dimensions } from "react-native";
import { TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/notifications.styles";
import { Link } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface NotificationProps {
  notification: {
    _id: Id<"notifications">;
    type: "like" | "comment" | "follow";
    sender: {
      _id: Id<"users">;
      username: string;
      image: string;
    };
    post: {
      imageUrl: string;
    } | null;
    comment: string | undefined;
    _creationTime: number;
  };
  onDelete: (id: Id<"notifications">) => void;
}

export function SwipeableNotificationItem({
  notification,
  onDelete,
}: NotificationProps) {
  const translateX = useSharedValue(0);

  const handleDelete = () => {
    onDelete(notification._id);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = Math.min(0, event.translationX);
    })
    .onEnd(() => {
      if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          -SCREEN_WIDTH,
          { duration: 200 },
          () => {
            runOnJS(handleDelete)();
          },
        );
      } else {
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteButtonStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  return (
    <View style={styles.swipeContainer}>
      {/* Delete button — under the content */}
      <Animated.View style={[styles.deleteButton, deleteButtonStyle]}>
        <Ionicons name="trash-outline" size={24} color={COLORS.white} />
        <Text style={styles.deleteText}>Delete</Text>
      </Animated.View>

      {/* Swipeable content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.swipeContent, animatedStyle]}>
          <View style={styles.notificationItem}>
            {/* CONTENT */}
            <View style={styles.notificationContent}>
              {/* Avatar with Icon Badge */}
              <Link href={`/user/${notification.sender._id}`} asChild>
                <TouchableOpacity style={styles.avatarContainer}>
                  <Image
                    source={notification.sender.image}
                    style={styles.avatar}
                    contentFit="cover"
                    transition={200}
                  />
                  <View style={styles.iconBadge}>
                    {notification.type === "like" ? (
                      <Ionicons name="heart" size={14} color={COLORS.primary} />
                    ) : notification.type === "follow" ? (
                      <Ionicons name="person-add" size={14} color="#8B5CF6" />
                    ) : (
                      <Ionicons name="chatbubble" size={14} color="#3B82F6" />
                    )}
                  </View>
                </TouchableOpacity>
              </Link>

              {/* Notification Info */}
              <View style={styles.notificationInfo}>
                <Link href={`/user/${notification.sender._id}`} asChild>
                  <TouchableOpacity>
                    <Text style={styles.username}>
                      {notification.sender.username}
                    </Text>
                  </TouchableOpacity>
                </Link>

                <Text style={styles.action}>
                  {notification.type === "follow"
                    ? "started following you"
                    : notification.type === "like"
                      ? "liked your post"
                      : `commented: "${notification.comment}"`}
                </Text>

                <Text style={styles.timeAgo}>
                  {formatDistanceToNow(notification._creationTime, {
                    addSuffix: true,
                  })}
                </Text>
              </View>
            </View>

            {/* Post Image (if exists) */}
            {notification.post && (
              <Image
                source={notification.post.imageUrl}
                style={styles.postImage}
                contentFit="cover"
                transition={200}
              />
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
