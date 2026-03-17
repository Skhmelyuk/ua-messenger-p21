import { View, Text, Image, TouchableOpacity } from "react-native";
import { styles } from "@/styles/login.styles";
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from "@/constants/theme";
import { useSSO } from "@clerk/expo";
import { useRouter } from "expo-router";


export default function ScreenLogin() {
    const { startSSOFlow } = useSSO();
    const router = useRouter();

    const handleGooglePress = async () => {
        try {
            const { createdSessionId, setActive } = await startSSOFlow({
                strategy: "oauth_google",
            });

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });
                router.replace("/(tabs)");
            }
        } catch (err) {
            console.error("OAuth Error", JSON.stringify(err, null, 2));
        }
    };


    return (
        <View style={styles.container}>
            {/* Brend sections */}
            <View style={styles.brandSection}>
                <View style={styles.logoContainer}>
                    <Ionicons
                        name="accessibility-outline"
                        size={24}
                        color={COLORS.primary}
                    />
                </View>
                <Text style={styles.appName}>UA-Messenger</Text>
                <Text style={styles.tagline}>Find your next adventure</Text>
            </View>
            {/* Illustration sections */}
            <View style={styles.illustrationContainer}>
                <Image
                    resizeMode="contain"
                    source={require("@/assets/images/android-icon-foreground.png")}
                    style={styles.illustration}
                />
            </View>
            {/* Login sections */}
            <View style={styles.loginSection}>
                <TouchableOpacity
                    style={styles.googleButton}
                    activeOpacity={0.9}
                    onPress={handleGooglePress}
                >
                    <View style={styles.googleIconContainer}>
                        <Ionicons name="logo-google" size={24} color={COLORS.surface} />
                    </View>
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}