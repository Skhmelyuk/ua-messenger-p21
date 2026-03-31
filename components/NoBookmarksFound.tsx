import { View, Text } from "react-native";
import { COLORS } from "@/constants/theme";

export default function NoBookmarksFound() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <Text style={{ color: COLORS.primary, fontSize: 22 }}>
        No bookmarked posts yet
      </Text>
    </View>
  );
}
