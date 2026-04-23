import {
  ScrollView,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { useState } from "react";
import { styles } from "@/styles/feed.styles";
import Story from "./Story";
import { StoryViewerModal } from "./StoryViewerModal";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { COLORS } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

type StoryUser = {
  id: string;
  username: string;
  avatar: string;
  hasStory: boolean;
};

function StoryWithViewer({ story }: { story: StoryUser }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const userStories = useQuery(
    api.stories.getStoriesByUser,
    story.hasStory ? { userId: story.id as Id<"users"> } : "skip",
  );

  const handlePress = () => {
    if (story.hasStory && userStories && userStories.length > 0) {
      setViewerOpen(true);
    }
  };

  return (
    <>
      <Story story={story} onPress={handlePress} />
      {viewerOpen && userStories && (
        <StoryViewerModal
          visible={viewerOpen}
          user={story}
          stories={userStories}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
}

export const StoriesSection = () => {
  const stories = useQuery(api.users.getStoriesUsers);
  const generateUploadUrl = useMutation(api.stories.generateUploadUrl);
  const createStory = useMutation(api.stories.createStory);

  const handleCreateStory = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const uploadUrl = await generateUploadUrl();

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": asset.mimeType ?? "image/jpeg" },
        body: blob,
      });

      const { storageId } = await uploadResponse.json();
      await createStory({ storageId });
    } catch (error) {
      Alert.alert("Error", "Failed to create story");
    }
  };

  if (stories === undefined) {
    return (
      <View style={styles.storiesContainer}>
        <ActivityIndicator size="small" color="#0095f6" />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.storiesContainer}
    >
      {/* Кнопка створення story */}
      <TouchableOpacity
        style={storyStyles.addWrapper}
        onPress={handleCreateStory}
      >
        <View style={storyStyles.addRing}>
          <Ionicons name="add" size={32} color={COLORS.primary} />
        </View>
        <Text style={storyStyles.addLabel}>Add Story</Text>
      </TouchableOpacity>

      {stories.map((story) => (
        <StoryWithViewer key={story.id} story={story} />
      ))}
    </ScrollView>
  );
};

const storyStyles = StyleSheet.create({
  addWrapper: {
    alignItems: "center",
    marginHorizontal: 8,
    width: 72,
  },
  addRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    backgroundColor: COLORS.surface,
  },
  addLabel: {
    fontSize: 11,
    color: COLORS.white,
    textAlign: "center",
  },
});
