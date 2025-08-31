import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from './StorageService';

export type PostType = 'tip' | 'progress' | 'motivation' | 'modification' | 'support';

export interface CommunityPost {
  id: string;
  content: string;
  postType: PostType;
  anonymousUsername: string;
  timestamp: string;
  rallyCount: number;
  isReported: boolean;
  userStats?: {
    xp: number;
    streak: number;
    totalWorkouts: number;
  };
}

export interface UserRally {
  postId: string;
  timestamp: string;
}

/**
 * Community Service for managing THRIVE's anonymous peer support system
 * Handles post creation, rally interactions, crisis detection, and content moderation
 */
export class CommunityService {
  private static readonly STORAGE_KEYS = {
    POSTS: 'community_posts',
    USER_RALLIES: 'user_rallies',
    ANONYMOUS_USERNAME: 'anonymous_username',
    REPORTED_POSTS: 'reported_posts'
  };

  // Crisis detection keywords for mental health safety
  private static readonly CRISIS_KEYWORDS = [
    'suicide', 'suicidal', 'kill myself', 'end it all', 'worthless',
    'self harm', 'cutting', 'hurt myself', 'overdose', 'pills',
    'hopeless', 'no point', 'better off dead', 'want to die'
  ];

  // Motivational usernames for anonymous support system
  private static readonly ANONYMOUS_USERNAMES = [
    'BraveWarrior', 'StrongSoul', 'ResilientHeart', 'CourageousSpirit',
    'MightyMinds', 'ThrivingFighter', 'WellnessGuardian', 'HopeBearer',
    'ZenSeeker', 'MindfulJourney', 'BalanceKeeper', 'InnerStrength',
    'QuietCourage', 'GentlePower', 'SteadyProgress', 'BrightPath',
    'CalmWarrior', 'WiseHeart', 'KindSpirit', 'TrueGrit',
    'FocusedMind', 'SereneForce', 'BoldJourney', 'PeacefulFighter',
    'StrongTide', 'QuietThunder', 'BraveStorm', 'GentleGiant',
    'MightyOak', 'SwiftCurrent', 'SteadyAnchor', 'BrightBeacon'
  ];

  /**
   * Generate a random anonymous username for privacy protection
   */
  static async getAnonymousUsername(): Promise<string> {
    try {
      let username = await AsyncStorage.getItem(this.STORAGE_KEYS.ANONYMOUS_USERNAME);
      
      if (!username) {
        // Generate new anonymous username
        const randomIndex = Math.floor(Math.random() * this.ANONYMOUS_USERNAMES.length);
        const randomNumber = Math.floor(Math.random() * 999) + 1;
        username = `${this.ANONYMOUS_USERNAMES[randomIndex]}${randomNumber}`;
        
        await AsyncStorage.setItem(this.STORAGE_KEYS.ANONYMOUS_USERNAME, username);
      }
      
      return username;
    } catch (error) {
      console.error('Failed to get anonymous username:', error);
      return 'ThriverAnon' + Math.floor(Math.random() * 999);
    }
  }

  /**
   * Create a new community post with crisis detection and content validation
   */
  static async createPost(
    content: string,
    postType: PostType,
    userStats?: { xp: number; streak: number; totalWorkouts: number }
  ): Promise<boolean> {
    try {
      // Validate content
      if (!content || content.trim().length === 0) {
        throw new Error('Post content cannot be empty');
      }

      if (content.length > 280) {
        throw new Error('Post content exceeds 280 character limit');
      }

      // Crisis detection - check for concerning content
      const lowerContent = content.toLowerCase();
      const containsCrisisKeywords = this.CRISIS_KEYWORDS.some(keyword => 
        lowerContent.includes(keyword)
      );

      if (containsCrisisKeywords) {
        // Don't create the post, but provide crisis resources
        console.warn('Crisis keywords detected in post content');
        
        // In a real app, this would trigger crisis intervention
        // For now, we'll prevent the post from being created
        throw new Error(
          'Your message contains concerning language. Please consider reaching out to a mental health professional or crisis helpline. Your safety matters.'
        );
      }

      // Get anonymous username
      const anonymousUsername = await this.getAnonymousUsername();

      // Create new post
      const newPost: CommunityPost = {
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: content.trim(),
        postType,
        anonymousUsername,
        timestamp: new Date().toISOString(),
        rallyCount: 0,
        isReported: false,
        userStats
      };

      // Save to storage
      const existingPosts = await this.getCommunityPosts();
      const updatedPosts = [newPost, ...existingPosts];
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.POSTS,
        JSON.stringify(updatedPosts)
      );

      return true;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }

  /**
   * Get all community posts, filtered to exclude reported posts
   */
  static async getCommunityPosts(): Promise<CommunityPost[]> {
    try {
      const postsJson = await AsyncStorage.getItem(this.STORAGE_KEYS.POSTS);
      const reportedPostsJson = await AsyncStorage.getItem(this.STORAGE_KEYS.REPORTED_POSTS);
      
      let posts: CommunityPost[] = [];
      let reportedPostIds: string[] = [];
      
      if (postsJson) {
        posts = JSON.parse(postsJson);
      }
      
      if (reportedPostsJson) {
        reportedPostIds = JSON.parse(reportedPostsJson);
      }

      // Filter out reported posts and add sample posts if empty
      const filteredPosts = posts.filter(post => !reportedPostIds.includes(post.id));
      
      // Add sample posts if community is empty to encourage engagement
      if (filteredPosts.length === 0) {
        const samplePosts = await this.generateSamplePosts();
        return samplePosts;
      }

      // Sort by timestamp (newest first) and limit to recent posts
      return filteredPosts
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 50); // Limit to 50 most recent posts for performance
    } catch (error) {
      console.error('Failed to get community posts:', error);
      return await this.generateSamplePosts();
    }
  }

  /**
   * Generate sample community posts to encourage engagement
   */
  private static async generateSamplePosts(): Promise<CommunityPost[]> {
    const samplePosts: CommunityPost[] = [
      {
        id: 'sample_1',
        content: 'Just completed my first week of THRIVE workouts! The 5-minute sessions are perfect for my ADHD brain. Small wins count! 💪',
        postType: 'progress',
        anonymousUsername: 'BraveWarrior42',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        rallyCount: 8,
        isReported: false,
        userStats: { xp: 150, streak: 7, totalWorkouts: 12 }
      },
      {
        id: 'sample_2',
        content: 'Modification tip: If jumping jacks are too much, try marching in place while clapping. Same energy, gentler on joints!',
        postType: 'tip',
        anonymousUsername: 'WellnessGuardian91',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        rallyCount: 15,
        isReported: false
      },
      {
        id: 'sample_3',
        content: 'Reminder: You don\'t have to be perfect. You don\'t have to do everything right. You just have to keep trying. One breath at a time.',
        postType: 'motivation',
        anonymousUsername: 'HopeBearer27',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        rallyCount: 23,
        isReported: false
      },
      {
        id: 'sample_4',
        content: 'Having a tough day and struggling to start my workout. Any quick motivation to get moving?',
        postType: 'support',
        anonymousUsername: 'QuietCourage88',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
        rallyCount: 12,
        isReported: false
      },
      {
        id: 'sample_5',
        content: 'For anyone with wrist issues: Try wall push-ups instead of floor ones. Stand arm\'s length from wall, lean in and push back. Works great!',
        postType: 'modification',
        anonymousUsername: 'GentlePower33',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
        rallyCount: 19,
        isReported: false
      }
    ];

    return samplePosts;
  }

  /**
   * Add a rally (like/support) to a post
   */
  static async addRally(postId: string): Promise<boolean> {
    try {
      // Update post rally count
      const posts = await this.getCommunityPosts();
      const updatedPosts = posts.map(post => 
        post.id === postId 
          ? { ...post, rallyCount: post.rallyCount + 1 }
          : post
      );
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.POSTS,
        JSON.stringify(updatedPosts)
      );

      // Track user's rally
      const userRallies = await this.getUserRallies();
      const newRally: UserRally = {
        postId,
        timestamp: new Date().toISOString()
      };
      
      const updatedRallies = [...userRallies, newRally];
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.USER_RALLIES,
        JSON.stringify(updatedRallies)
      );

      return true;
    } catch (error) {
      console.error('Failed to add rally:', error);
      return false;
    }
  }

  /**
   * Remove a rally from a post
   */
  static async removeRally(postId: string): Promise<boolean> {
    try {
      // Update post rally count
      const posts = await this.getCommunityPosts();
      const updatedPosts = posts.map(post => 
        post.id === postId 
          ? { ...post, rallyCount: Math.max(0, post.rallyCount - 1) }
          : post
      );
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.POSTS,
        JSON.stringify(updatedPosts)
      );

      // Remove user's rally
      const userRallies = await this.getUserRallies();
      const updatedRallies = userRallies.filter(rally => rally.postId !== postId);
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.USER_RALLIES,
        JSON.stringify(updatedRallies)
      );

      return true;
    } catch (error) {
      console.error('Failed to remove rally:', error);
      return false;
    }
  }

  /**
   * Get list of post IDs that the user has rallied
   */
  static async getUserRallies(): Promise<string[]> {
    try {
      const ralliesJson = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_RALLIES);
      
      if (ralliesJson) {
        const rallies: UserRally[] = JSON.parse(ralliesJson);
        return rallies.map(rally => rally.postId);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get user rallies:', error);
      return [];
    }
  }

  /**
   * Report a post for inappropriate content
   */
  static async reportPost(postId: string): Promise<boolean> {
    try {
      const reportedPostsJson = await AsyncStorage.getItem(this.STORAGE_KEYS.REPORTED_POSTS);
      let reportedPosts: string[] = [];
      
      if (reportedPostsJson) {
        reportedPosts = JSON.parse(reportedPostsJson);
      }
      
      if (!reportedPosts.includes(postId)) {
        reportedPosts.push(postId);
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.REPORTED_POSTS,
          JSON.stringify(reportedPosts)
        );
      }
      
      return true;
    } catch (error) {
      console.error('Failed to report post:', error);
      return false;
    }
  }

  /**
   * Clear all community data (for testing/reset purposes)
   */
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.POSTS,
        this.STORAGE_KEYS.USER_RALLIES,
        this.STORAGE_KEYS.ANONYMOUS_USERNAME,
        this.STORAGE_KEYS.REPORTED_POSTS
      ]);
    } catch (error) {
      console.error('Failed to clear community data:', error);
    }
  }

  /**
   * Get community statistics
   */
  static async getCommunityStats(): Promise<{
    totalPosts: number;
    totalRallies: number;
    activeUsers: number;
  }> {
    try {
      const posts = await this.getCommunityPosts();
      const totalRallies = posts.reduce((sum, post) => sum + post.rallyCount, 0);
      const uniqueUsers = new Set(posts.map(post => post.anonymousUsername)).size;
      
      return {
        totalPosts: posts.length,
        totalRallies,
        activeUsers: uniqueUsers
      };
    } catch (error) {
      console.error('Failed to get community stats:', error);
      return {
        totalPosts: 0,
        totalRallies: 0,
        activeUsers: 0
      };
    }
  }

  /**
   * Check if content contains crisis keywords (for testing/validation)
   */
  static containsCrisisKeywords(content: string): boolean {
    const lowerContent = content.toLowerCase();
    return this.CRISIS_KEYWORDS.some(keyword => lowerContent.includes(keyword));
  }

  /**
   * Get crisis resources message
   */
  static getCrisisResourcesMessage(): string {
    return `If you're having thoughts of self-harm, please reach out for help:

• National Suicide Prevention Lifeline: 988
• Crisis Text Line: Text HOME to 741741
• NAMI HelpLine: 1-800-950-6264

Your life has value. You matter. Help is available.`;
  }
}