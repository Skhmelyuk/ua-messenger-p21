import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { COLORS } from "@/constants/theme";
import { Id } from "@/convex/_generated/dataModel";

type PostProps = {
  post: {
    _id: Id<"posts">;
    userId: Id<"users">;
    storageId: Id<"_storage">;
    imageUrl: string;
    caption?: string;
    likes: number;
    comments: number;
    _creationTime: number;
    isLiked: boolean;
    isBookmarked: boolean;
    author: {
      _id: Id<"users">;
      username: string;
      image: string;
    };
  };
};

export const Post = ({ post }: PostProps) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const toggleLike = useMutation(api.likes.toggleLike);

  const handleLike = async () => {
    try {
      const newIsLiked = await toggleLike({ postId: post._id });
      setIsLiked(newIsLiked);
      setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <TouchableOpacity style={styles.postHeaderLeft}>
          <Image source={post.author.image} style={styles.postAvatar} />
          <Text style={styles.postUsername}>{post.author.username}</Text>
        </TouchableOpacity>
      </View>

      <Image
        source={post.imageUrl}
        style={styles.postImage}
        contentFit="cover"
      />

      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "#FF3B30" : COLORS.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {likesCount > 0
            ? `${likesCount.toLocaleString()} likes`
            : "Be the first to like"}
        </Text>
        <Text style={styles.timeAgo}>
          {formatDistanceToNow(post._creationTime, { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
};
