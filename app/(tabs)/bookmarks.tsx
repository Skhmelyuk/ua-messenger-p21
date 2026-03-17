import { View, Text, StyleSheet } from "react-native";

export default function ScreenBookmarks() {
    return (
        <View style={styles.container}>
            <Text style={{ color: "#fff" }}>Screen Bookmarks</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
    },
});