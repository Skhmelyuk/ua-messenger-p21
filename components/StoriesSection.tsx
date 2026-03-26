import { ScrollView } from "react-native";
import { styles } from "@/styles/feed.styles";
import Story from "./Story";
import { STORIES } from "@/constants/mock-date";

export const StoriesSection = () => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.storiesContainer}
  >
    {STORIES.map((story) => (
      <Story key={story.id} story={story} />
    ))}
  </ScrollView>
);
