import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CommunityTab() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleEmoji}>🌱</Text>
            <Ionicons name="people" size={48} color="#16A34A" style={{marginHorizontal: 8}} />
            <Text style={styles.titleEmoji}>🌱</Text>
          </View>
          <Text style={styles.title}>
            <Text style={styles.titleHighlight}>THRIVE</Text> Community
          </Text>
          <Text style={styles.subtitle}>
            Safe space for anonymous support • Coming Soon! 🚀
          </Text>
        </View>

        <View style={styles.featureContainer}>
          <Text style={styles.sectionTitle}>Features in Development:</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Anonymous Support</Text>
              <Text style={styles.featureDescription}>
                Share your journey safely with auto-generated usernames
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="heart" size={24} color="#EF4444" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Rally System</Text>
              <Text style={styles.featureDescription}>
                Send support and encouragement to community members
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="alert-circle" size={24} color="#F59E0B" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Crisis Detection</Text>
              <Text style={styles.featureDescription}>
                Automatic keyword monitoring with immediate resources
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="chatbubbles" size={24} color="#8B5CF6" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>ADHD-Friendly Sharing</Text>
              <Text style={styles.featureDescription}>
                280-character limit posts designed for focus and clarity
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            The community features from Phase 1 are being converted to React Native. 
            This will include all the same safety features and anonymous support system! 💙
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  titleHighlight: {
    color: '#16A34A',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 20,
  },
  featureContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureText: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  messageContainer: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: 24,
  },
});