import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { COLORS } from "@/constants/theme";

const { width, height } = Dimensions.get("window");
const STORY_DURATION = 5000;

type StoryItem = {
  _id: Id<"stories">;
  imageUrl: string;
  userId: Id<"users">;
  views: number;
  expiresAt: number;
};

type StoryUser = {
  id: string;
  username: string;
  avatar: string;
};

type Props = {
  visible: boolean;
  user: StoryUser;
  stories: StoryItem[];
  onClose: () => void;
};

export function StoryViewerModal({ visible, user, stories, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const animation = useRef<Animated.CompositeAnimation | null>(null);
  const incrementViews = useMutation(api.stories.incrementViews);

  const currentStory = stories[currentIndex];

  const startProgress = () => {
    progress.setValue(0);
    animation.current = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });
    animation.current.start(({ finished }) => {
      if (finished) goNext();
    });
  };

  const stopProgress = () => {
    animation.current?.stop();
  };

  useEffect(() => {
    if (!visible || stories.length === 0) return;
    startProgress();
    if (currentStory) {
      incrementViews({ storyId: currentStory._id }).catch(() => {});
    }
    return () => stopProgress();
  }, [visible, currentIndex]);

  const goNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleClose();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      stopProgress();
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleClose = () => {
    stopProgress();
    setCurrentIndex(0);
    onClose();
  };

  if (!visible || stories.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Full-screen image */}
        <Image
          source={{ uri: currentStory?.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Progress bars */}
        <View style={styles.progressContainer}>
          {stories.map((_, index) => (
            <View key={index} style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width:
                      index < currentIndex
                        ? "100%"
                        : index === currentIndex
                          ? progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0%", "100%"],
                            })
                          : "0%",
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <Text style={styles.username}>{user.username}</Text>
          </View>
          <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Tap zones */}
        <View style={styles.tapZones}>
          <TouchableOpacity style={styles.tapLeft} onPress={goPrev} activeOpacity={1} />
          <TouchableOpacity style={styles.tapRight} onPress={goNext} activeOpacity={1} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  image: {
    width,
    height,
    position: "absolute",
  },
  progressContainer: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingTop: 48,
    gap: 4,
    zIndex: 10,
  },
  progressTrack: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    zIndex: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  username: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },
  tapZones: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    zIndex: 5,
  },
  tapLeft: {
    flex: 1,
  },
  tapRight: {
    flex: 1,
  },
});
