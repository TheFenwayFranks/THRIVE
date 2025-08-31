import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Anonymous user name generator
const ANONYMOUS_PREFIXES = ['Brave', 'Strong', 'Wise', 'Gentle', 'Fierce', 'Calm', 'Bold', 'Kind'];
const ANONYMOUS_SUFFIXES = ['Warrior', 'Sprout', 'Phoenix', 'Lion', 'Butterfly', 'Oak', 'Star', 'River'];

// Crisis detection keywords
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'no point', 'give up', 'hopeless',
  'harm myself', 'hurt myself', 'not worth', 'better off dead', 'can\'t go on'
];

// Sample community posts for demonstration
const SAMPLE_POSTS = [
  {
    id: '1',
    username: 'BraveWarrior47',
    timestamp: '2 hours ago',
    content: 'Started with gentle movement today and it turned into steady! Sometimes our bodies surprise us. 🌱➡️🚶',
    hearts: 12,
    replies: 3
  },
  {
    id: '2',
    username: 'CalmSprout23',
    timestamp: '4 hours ago',
    content: 'ADHD brain was scattered today but 5 minutes of breathing exercises helped me center. Small wins count! 💙',
    hearts: 8,
    replies: 1
  },
  {
    id: '3',
    username: 'FiercePhoenix91',
    timestamp: '6 hours ago',
    content: 'Beast mode completed! Feeling like I can conquer anything. To anyone struggling today - you\'ve got this! 🔥',
    hearts: 15,
    replies: 5
  },
  {
    id: '4',
    username: 'GentleOak18',
    timestamp: '1 day ago',
    content: 'Bad mental health day but I showed up for myself with gentle stretches. Progress isn\'t always linear. 🌳',
    hearts: 20,
    replies: 7
  }
];

interface Post {
  id: string;
  username: string;
  timestamp: string;
  content: string;
  hearts: number;
  replies: number;
  isHeartedByUser?: boolean;
}

export default function CommunityTabComplete() {
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [userAnonymousName, setUserAnonymousName] = useState('');
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  useEffect(() => {
    generateAnonymousName();
  }, []);

  const generateAnonymousName = () => {
    const prefix = ANONYMOUS_PREFIXES[Math.floor(Math.random() * ANONYMOUS_PREFIXES.length)];
    const suffix = ANONYMOUS_SUFFIXES[Math.floor(Math.random() * ANONYMOUS_SUFFIXES.length)];
    const number = Math.floor(Math.random() * 99) + 1;
    setUserAnonymousName(`${prefix}${suffix}${number}`);
  };

  const detectCrisisKeywords = (text: string): boolean => {
    const lowercaseText = text.toLowerCase();
    return CRISIS_KEYWORDS.some(keyword => lowercaseText.includes(keyword));
  };

  const handlePostSubmit = () => {
    if (newPostContent.trim().length === 0) {
      Alert.alert('Empty Post', 'Please write something to share with the community.');
      return;
    }

    if (newPostContent.length > 280) {
      Alert.alert('Post Too Long', 'Please keep posts under 280 characters for better focus and readability.');
      return;
    }

    // Check for crisis keywords
    if (detectCrisisKeywords(newPostContent)) {
      setShowCrisisModal(true);
      return;
    }

    // Create new post
    const newPost: Post = {
      id: Date.now().toString(),
      username: userAnonymousName,
      timestamp: 'now',
      content: newPostContent.trim(),
      hearts: 0,
      replies: 0,
      isHeartedByUser: false
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setShowPostModal(false);

    Alert.alert(
      'Post Shared! 🌟',
      'Your anonymous post has been shared with the THRIVE community. Thank you for connecting and supporting others!',
      [{ text: 'Continue', style: 'default' }]
    );
  };

  const handleHeartPress = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isHeartedByUser: !post.isHeartedByUser,
          hearts: post.isHeartedByUser ? post.hearts - 1 : post.hearts + 1
        };
      }
      return post;
    }));
  };

  const handleCrisisSupport = () => {
    setShowCrisisModal(false);
    setNewPostContent('');
    Alert.alert(
      'We\'re Here for You 💙',
      'Your safety matters. Please reach out to:\n\n• Crisis Text Line: Text HOME to 741741\n• National Suicide Prevention Lifeline: 988\n• Emergency Services: 911\n\nYou are not alone. There are people who want to help.',
      [
        { text: 'I understand', style: 'default' },
        { text: 'Share a different post', onPress: () => setShowPostModal(true) }
      ]
    );
  };

  const renderPost = (post: Post) => (
    <View key={post.id} style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{post.username.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.timestamp}>{post.timestamp}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.postContent}>{post.content}</Text>
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleHeartPress(post.id)}
        >
          <Ionicons 
            name={post.isHeartedByUser ? 'heart' : 'heart-outline'} 
            size={20} 
            color={post.isHeartedByUser ? '#EF4444' : '#6B7280'} 
          />
          <Text style={[styles.actionText, post.isHeartedByUser && styles.heartedText]}>
            {post.hearts}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
          <Text style={styles.actionText}>{post.replies}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rallyButton}>
          <Ionicons name="megaphone-outline" size={18} color="#16A34A" />
          <Text style={styles.rallyText}>Rally</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleEmoji}>🌱</Text>
            <Ionicons name="people" size={32} color="#16A34A" style={{marginHorizontal: 8}} />
            <Text style={styles.titleEmoji}>🌱</Text>
          </View>
          <Text style={styles.title}>
            <Text style={styles.titleHighlight}>THRIVE</Text> Community
          </Text>
          <Text style={styles.subtitle}>
            Anonymous support • Safe space • Crisis monitoring 💙
          </Text>
        </View>

        {/* Community Guidelines */}
        <View style={styles.guidelinesCard}>
          <View style={styles.guidelinesHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
          </View>
          <Text style={styles.guidelinesText}>
            • Be kind and supportive{'\n'}
            • Keep posts under 280 characters{'\n'}
            • No personal information sharing{'\n'}
            • Crisis detection system monitors for safety
          </Text>
        </View>

        {/* Post Button */}
        <TouchableOpacity 
          style={styles.createPostButton}
          onPress={() => setShowPostModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.createPostText}>Share with Community</Text>
        </TouchableOpacity>

        {/* Posts Feed */}
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>Community Posts</Text>
          <Text style={styles.feedSubtitle}>Supporting each other on our wellness journeys</Text>
        </View>

        {posts.map(renderPost)}

        {/* Anonymous Identity Card */}
        <View style={styles.identityCard}>
          <Text style={styles.identityTitle}>Your Anonymous Identity</Text>
          <View style={styles.identityInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{userAnonymousName.charAt(0)}</Text>
            </View>
            <Text style={styles.identityName}>{userAnonymousName}</Text>
          </View>
          <Text style={styles.identityDescription}>
            Your identity is automatically generated and changes periodically for privacy. 
            No personal information is ever shared.
          </Text>
        </View>
      </ScrollView>

      {/* Create Post Modal */}
      <Modal
        visible={showPostModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPostModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.postModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share with Community</Text>
              <TouchableOpacity onPress={() => setShowPostModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.posterInfo}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{userAnonymousName.charAt(0)}</Text>
              </View>
              <Text style={styles.posterName}>{userAnonymousName}</Text>
            </View>

            <TextInput
              style={styles.postInput}
              placeholder="Share your thoughts, encouragement, or ask for support... (280 characters max)"
              multiline={true}
              value={newPostContent}
              onChangeText={setNewPostContent}
              maxLength={280}
            />

            <View style={styles.postInputFooter}>
              <Text style={[
                styles.characterCount,
                newPostContent.length > 250 && styles.characterCountWarning
              ]}>
                {newPostContent.length}/280
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowPostModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.postButton,
                    newPostContent.trim().length === 0 && styles.postButtonDisabled
                  ]}
                  onPress={handlePostSubmit}
                  disabled={newPostContent.trim().length === 0}
                >
                  <Text style={styles.postButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Crisis Support Modal */}
      <Modal
        visible={showCrisisModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCrisisModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.crisisModal}>
            <Text style={styles.crisisIcon}>💙</Text>
            <Text style={styles.crisisTitle}>We're Here for You</Text>
            <Text style={styles.crisisMessage}>
              We noticed your message might indicate you're going through a difficult time. 
              Your safety and wellbeing matter to us.
            </Text>
            
            <View style={styles.crisisResources}>
              <Text style={styles.crisisResourcesTitle}>Immediate Support:</Text>
              <Text style={styles.crisisResource}>• Crisis Text Line: Text HOME to 741741</Text>
              <Text style={styles.crisisResource}>• National Suicide Prevention Lifeline: 988</Text>
              <Text style={styles.crisisResource}>• Emergency Services: 911</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.crisisButton}
              onPress={handleCrisisSupport}
            >
              <Text style={styles.crisisButtonText}>I understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleEmoji: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  titleHighlight: {
    color: '#16A34A',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  guidelinesCard: {
    backgroundColor: '#F0FDF4',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginLeft: 8,
  },
  guidelinesText: {
    fontSize: 14,
    color: '#15803D',
    lineHeight: 20,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  createPostText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  feedHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  feedSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  postCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  postHeader: {
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  postContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  heartedText: {
    color: '#EF4444',
  },
  rallyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rallyText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
    marginLeft: 4,
  },
  identityCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  identityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  identityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  identityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
    marginLeft: 12,
  },
  identityDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  postModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  posterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
    marginLeft: 12,
  },
  postInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  postInputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  characterCountWarning: {
    color: '#EF4444',
  },
  modalButtons: {
    flexDirection: 'row',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  postButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  postButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Crisis Modal Styles
  crisisModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: 350,
    alignSelf: 'center',
    marginTop: 100,
  },
  crisisIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  crisisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  crisisMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  crisisResources: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  crisisResourcesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
  },
  crisisResource: {
    fontSize: 13,
    color: '#DC2626',
    marginBottom: 4,
  },
  crisisButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  crisisButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});