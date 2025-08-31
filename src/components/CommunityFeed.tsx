import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CommunityService, CommunityPost, PostType } from '../services/CommunityService';

interface CommunityFeedProps {
  userStats?: {
    xp: number;
    streak: number;
    totalWorkouts: number;
  };
}

export default function CommunityFeed({ userStats }: CommunityFeedProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // State management
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [selectedPostType, setSelectedPostType] = useState<PostType>('motivation');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [ralliedPosts, setRalliedPosts] = useState<string[]>([]);

  // Load community posts on mount
  useEffect(() => {
    loadCommunityPosts();
    loadUserRallies();
  }, []);

  const loadCommunityPosts = async () => {
    try {
      const communityPosts = await CommunityService.getCommunityPosts();
      setPosts(communityPosts);
    } catch (error) {
      console.error('Failed to load community posts:', error);
    }
  };

  const loadUserRallies = async () => {
    try {
      const rallies = await CommunityService.getUserRallies();
      setRalliedPosts(rallies);
    } catch (error) {
      console.error('Failed to load user rallies:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCommunityPosts();
    await loadUserRallies();
    setIsRefreshing(false);
  };

  const handleCreatePost = async () => {
    if (newPostText.trim().length === 0) {
      Alert.alert('Empty Post', 'Please write something to share with the community.');
      return;
    }

    if (newPostText.length > 280) {
      Alert.alert('Post Too Long', 'Please keep posts under 280 characters for easy reading.');
      return;
    }

    try {
      const success = await CommunityService.createPost(
        newPostText.trim(),
        selectedPostType,
        userStats
      );

      if (success) {
        setNewPostText('');
        setShowComposer(false);
        await loadCommunityPosts();
        
        Alert.alert(
          'Post Shared!',
          'Your post has been shared with the THRIVE community. Thank you for supporting others!'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share post. Please try again.');
      console.error('Failed to create post:', error);
    }
  };

  const handleRally = async (postId: string) => {
    try {
      const wasRallied = ralliedPosts.includes(postId);
      
      if (wasRallied) {
        // Remove rally
        await CommunityService.removeRally(postId);
        setRalliedPosts(prev => prev.filter(id => id !== postId));
      } else {
        // Add rally
        await CommunityService.addRally(postId);
        setRalliedPosts(prev => [...prev, postId]);
      }

      // Update post rally count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, rallyCount: post.rallyCount + (wasRallied ? -1 : 1) }
          : post
      ));
    } catch (error) {
      console.error('Failed to rally post:', error);
    }
  };

  const handleReport = (postId: string) => {
    Alert.alert(
      'Report Post',
      'Report this post for inappropriate content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: async () => {
            try {
              await CommunityService.reportPost(postId);
              Alert.alert('Thank You', 'Post has been reported for review.');
            } catch (error) {
              Alert.alert('Error', 'Failed to report post.');
            }
          }
        }
      ]
    );
  };

  const getPostTypeColor = (postType: PostType): string => {
    switch (postType) {
      case 'tip': return theme.colors.info;
      case 'progress': return theme.colors.success;
      case 'motivation': return theme.colors.celebration;
      case 'modification': return theme.colors.mood;
      case 'support': return theme.colors.primary;
      default: return theme.colors.textSecondary;
    }
  };

  const getPostTypeLabel = (postType: PostType): string => {
    switch (postType) {
      case 'tip': return 'TIP';
      case 'progress': return 'PROGRESS';
      case 'motivation': return 'MOTIVATION';
      case 'modification': return 'MODIFICATION';
      case 'support': return 'SUPPORT';
      default: return 'POST';
    }
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffMs = now.getTime() - postTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  const postTypeOptions: { type: PostType; label: string; description: string }[] = [
    { type: 'motivation', label: 'Motivation', description: 'Encourage others' },
    { type: 'progress', label: 'Progress', description: 'Share your wins' },
    { type: 'tip', label: 'Tip', description: 'Helpful advice' },
    { type: 'modification', label: 'Modification', description: 'Exercise adaptations' },
    { type: 'support', label: 'Support', description: 'Need encouragement' }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>THRIVE Community</Text>
        <Text style={styles.subtitle}>Anonymous peer support for mental wellness</Text>
        
        <TouchableOpacity
          style={styles.composeButton}
          onPress={() => setShowComposer(!showComposer)}
        >
          <Text style={styles.composeButtonText}>
            {showComposer ? 'Cancel' : 'Share Support'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Post Composer */}
      {showComposer && (
        <View style={styles.composer}>
          <Text style={styles.composerTitle}>Share with Community</Text>
          
          {/* Post Type Selection */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.postTypeSelector}>
            {postTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.postTypeOption,
                  selectedPostType === option.type && styles.postTypeOptionSelected
                ]}
                onPress={() => setSelectedPostType(option.type)}
              >
                <Text style={[
                  styles.postTypeText,
                  selectedPostType === option.type && styles.postTypeTextSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.postTypeDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            placeholder="What would you like to share? (280 characters max)"
            placeholderTextColor={theme.colors.textMuted}
            value={newPostText}
            onChangeText={setNewPostText}
            multiline
            maxLength={280}
          />
          
          <View style={styles.composerFooter}>
            <Text style={styles.characterCount}>
              {newPostText.length}/280 characters
            </Text>
            <TouchableOpacity
              style={[
                styles.postButton,
                newPostText.trim().length === 0 && styles.postButtonDisabled
              ]}
              onPress={handleCreatePost}
              disabled={newPostText.trim().length === 0}
            >
              <Text style={styles.postButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Community Feed */}
      <ScrollView
        style={styles.feedContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Welcome to THRIVE Community</Text>
            <Text style={styles.emptyStateText}>
              Be the first to share support, tips, or motivation with the community.
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <View style={styles.postHeaderLeft}>
                  <Text style={styles.username}>{post.anonymousUsername}</Text>
                  <View style={[styles.postTypeBadge, { backgroundColor: getPostTypeColor(post.postType) }]}>
                    <Text style={styles.postTypeBadgeText}>
                      {getPostTypeLabel(post.postType)}
                    </Text>
                  </View>
                </View>
                <View style={styles.postHeaderRight}>
                  <Text style={styles.timeAgo}>{getTimeAgo(post.timestamp)}</Text>
                  <TouchableOpacity
                    style={styles.reportButton}
                    onPress={() => handleReport(post.id)}
                  >
                    <Text style={styles.reportButtonText}>⚠</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Post Content */}
              <Text style={styles.postContent}>{post.content}</Text>

              {/* Post Footer */}
              <View style={styles.postFooter}>
                <TouchableOpacity
                  style={[
                    styles.rallyButton,
                    ralliedPosts.includes(post.id) && styles.rallyButtonActive
                  ]}
                  onPress={() => handleRally(post.id)}
                >
                  <Text style={[
                    styles.rallyButtonText,
                    ralliedPosts.includes(post.id) && styles.rallyButtonTextActive
                  ]}>
                    {ralliedPosts.includes(post.id) ? '💪' : '👍'} Rally
                  </Text>
                  {post.rallyCount > 0 && (
                    <Text style={styles.rallyCount}>{post.rallyCount}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  composeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  composeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  composer: {
    padding: 20,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  composerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  postTypeSelector: {
    marginBottom: 16,
  },
  postTypeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 100,
    alignItems: 'center',
  },
  postTypeOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  postTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  postTypeTextSelected: {
    color: '#FFFFFF',
  },
  postTypeDescription: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  composerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  postButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  postButtonDisabled: {
    backgroundColor: theme.colors.textMuted,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  feedContainer: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  postCard: {
    backgroundColor: theme.colors.card,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: 8,
  },
  postTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  postTypeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  timeAgo: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginRight: 8,
  },
  reportButton: {
    padding: 4,
  },
  reportButtonText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  postContent: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rallyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rallyButtonActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  rallyButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  rallyButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  rallyCount: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});