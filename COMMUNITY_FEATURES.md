# Community Features Documentation

## Overview
The app now includes comprehensive community features that allow users to:
- Join and create communities
- Post with captions and geolocation tagging
- React to posts with emojis
- Share results from other features (like compatibility tests) to communities

## Database Setup

### Supabase Tables
Run the SQL queries provided in the initial setup to create these tables:
- `communities` - Stores community information
- `community_members` - Tracks community membership
- `community_posts` - Stores user posts
- `post_reactions` - Tracks reactions to posts
- `user_profiles` - Stores user display names and avatars

### Row Level Security (RLS)
The database is configured with RLS policies that:
- Allow public viewing of public communities
- Restrict private communities to members only
- Allow authenticated users to create communities
- Ensure users can only modify their own content

## API Routes

### Communities
- `trpc.communities.list` - List all communities or user's communities
- `trpc.communities.create` - Create a new community
- `trpc.communities.join` - Join a community
- `trpc.communities.leave` - Leave a community

### Posts
- `trpc.communities.posts.list` - List posts in a community
- `trpc.communities.posts.create` - Create a new post
- `trpc.communities.posts.react` - Add/remove reaction to a post

### User Profiles
- `trpc.users.profile` - Create/update user profile

## UI Components

### Communities Screen (`app/(tabs)/communities.tsx`)
- Browse all communities or filter to "My Communities"
- Search communities by name
- Create new communities with name, description, and privacy settings
- Join/leave communities
- Navigate to individual community pages

### Community Detail Screen (`app/community/[id].tsx`)
- View all posts in a community
- Create new posts with:
  - Text captions
  - Geolocation tagging (using expo-location)
  - Shared data from other features
- React to posts with 5 emoji types:
  - ❤️ Heart
  - 🔥 Fire
  - 👏 Clap
  - 😂 Laugh
  - 😢 Cry
- View post author, timestamp, and reactions

### ShareToCommunityModal (`components/ShareToCommunityModal.tsx`)
A reusable modal component that allows sharing results from any feature to a community.

#### Usage Example:
```tsx
import { ShareToCommunityModal } from '@/components/ShareToCommunityModal';

const [showShareModal, setShowShareModal] = useState(false);

// In your component
<ShareToCommunityModal
  visible={showShareModal}
  onClose={() => setShowShareModal(false)}
  sharedFrom="Feature Name"
  sharedData={{
    // Any data you want to share
    score: 95,
    results: [],
    timestamp: new Date().toISOString(),
  }}
  onSuccess={() => Alert.alert('Success', 'Shared to community!')}
/>
```

## Integration with Existing Features

### Compatibility Test
The compatibility test screen now includes a "Share to Community" button that allows users to share their:
- Compatibility score
- Personalized suggestions
- Timestamp

To add similar sharing to other features:
1. Import `ShareToCommunityModal`
2. Add state for modal visibility
3. Add a share button that opens the modal
4. Pass the relevant data via `sharedData` prop

### Example Integration:
```tsx
import { ShareToCommunityModal } from '@/components/ShareToCommunityModal';

// In your component
const [showShareModal, setShowShareModal] = useState(false);

// Add share button
<TouchableOpacity onPress={() => setShowShareModal(true)}>
  <Share size={20} />
  <Text>Share to Community</Text>
</TouchableOpacity>

// Add modal
<ShareToCommunityModal
  visible={showShareModal}
  onClose={() => setShowShareModal(false)}
  sharedFrom="Your Feature Name"
  sharedData={yourDataObject}
/>
```

## Features

### Community Creation
- Name (required)
- Description (optional)
- Privacy setting (public/private)
- Automatically adds creator as owner

### Post Creation
- Caption text
- Geolocation tagging with reverse geocoding
- Shared data from other features
- Displays shared source badge

### Reactions
- 5 reaction types
- Users can add/remove their reactions
- Real-time reaction counts
- Visual indication of user's reactions

### Geolocation
- Requests location permission
- Gets current coordinates
- Reverse geocodes to city/region name
- Displayed on posts with location icon

## Tab Navigation
The Communities tab has been added to the main tab navigation with the UsersRound icon.

## TypeScript Types
All components are fully typed with TypeScript for type safety.

## Mobile-First Design
- Clean, modern mobile UI
- Safe area handling
- Smooth animations and transitions
- Touch-optimized buttons and interactions
