import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/styles/feed.styles";
import { COLORS } from "@/constants/theme";

export default function ScreenHome() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ua-messenger</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
