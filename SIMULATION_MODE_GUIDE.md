# Simulation Mode - Community Platform Demo System

## Overview

The **Simulation Mode** is a comprehensive demo and testing system for the BuildSmart Community platform. It generates 150+ realistic, construction-focused posts with diverse African user profiles, realistic engagement metrics, and clearly labeled demo content. The system is designed for demos, testing, and development without mixing with real user data.

---

## Features Implemented

### 1. **Simulation Data Layer** 

#### Mock Users (`/lib/mockUsers.ts`)
- **150 diverse user profiles** with:
  - Realistic African names (first & last) from multiple regions
  - Professional roles: Engineer, Architect, QS, Contractor, Student, Developer, Project Manager
  - Avatar generation using UI Avatars service
  - Verified flag (60% chance)
  - Company names from construction industry

#### Mock Posts (`/lib/mockPosts.ts`)
- **150+ construction-focused posts** with:
  - Realistic titles and captions from construction industry
  - Mixed media types: Video, Image, Text, Document, Audio
  - **100+ construction images** from Pexels (site photos, machinery, blueprints, etc.)
  - **Video sources**: Realistic site walkthrough videos from Pexels collection
  - Engagement metrics (likes, comments, shares, follows) with randomized counts
  - Realistic timestamps (last 7 days)
  - Construction-relevant tags (safety, equipment, materials, quality, planning, etc.)
  - Live session simulation (5% of posts)

### 2. **Simulation Management**

#### SimulationContext (`/contexts/SimulationContext.tsx`)
- Global state management for simulation mode
- Enable/disable simulation with one hook
- Auto-load all mock posts when enabled
- Reset functionality to reload fresh posts
- Integration with existing feed component

#### MockActivityEngine (`/lib/mockActivityEngine.ts`)
- Real-time activity simulation with configurable intervals:
  - **Posts**: New post every 8-15 seconds
  - **Likes**: New like every 3-6 seconds  
  - **Comments**: New comment every 10-20 seconds
  - **Follows**: New follow every 15-30 seconds
- Callback system for updating UI in real-time
- Can be started/stopped independently

### 3. **User Interface Components**

#### DemoModeBadge (`/components/community/DemoModeBadge.tsx`)
- Fixed position badge in top-right corner
- Shows "DEMO MODE" with pulsing indicator
- Only visible when simulation mode is active
- Clearly communicates demo status

#### DemoLabel (`/components/community/DemoLabel.tsx`)
- Three display variants:
  - **Badge**: Compact amber badge with icon
  - **Banner**: Full-width warning banner
  - **Inline**: Minimal text label
- Clearly marks all simulated content
- Amber color scheme for visibility

#### SimulationSettings (`/components/community/SimulationSettings.tsx`)
- Dedicated settings component for simulation control
- Toggle button to enable/disable simulation mode
- Display stats: Total demo posts, Status
- Reset button to reload all posts
- Warning box explaining demo nature

### 4. **Data Type Extensions**

#### Updated Types
- **CommunityPost**: Added `demoLabel` and `demoAuthor` fields
- **LocalItem (FeedItem)**: Added demo-related fields
- **PostCard**: Enhanced to display demo labels

---

## Usage

### Enable Simulation Mode (Client-Side)

```typescript
import { useSimulation } from '@/contexts/SimulationContext';

function MyComponent() {
  const { isSimulationMode, setIsSimulationMode } = useSimulation();
  
  // Toggle simulation mode
  const handleToggle = () => {
    setIsSimulationMode(!isSimulationMode);
  };
  
  return (
    <button onClick={handleToggle}>
      Simulation Mode: {isSimulationMode ? 'ON' : 'OFF'}
    </button>
  );
}
```

### Enable Via Environment Variable

```env
REACT_APP_SIMULATION_MODE=true
```

When enabled:
1. **DemoModeBadge** appears in top-right corner
2. **150+ mock posts** are loaded into the community feed
3. **Demo labels** appear on all simulated posts
4. **Activity simulation** (optional) generates realistic interactions

### Integration Points

#### 1. Community Feed
- Simulation posts are blended with real posts in CommunityHubV2
- Simulation data shown when real data is unavailable
- Safe fallback for development/testing

#### 2. Post Display
- PostCard shows "Demo/Simulated" label on simulated posts
- Amber badge clearly identifies demo content
- User info shows realistic African names and roles

#### 3. Sidebar Activity
- Demo posts appear in Saved section
- Realistic engagement metrics displayed
- No mixing with real user activity

---

## Data Specifications

### User Profile Structure
```typescript
{
  id: "demo_user_0",
  name: "Kwame Okafor",
  role: "Engineer",
  avatar: "https://ui-avatars.com/api/?name=Kwame+Okafor...",
  verified: true/false,
  company: "BuildSmart Solutions"
}
```

### Post Structure
```typescript
{
  id: "demo_post_0",
  type: "Article",
  title: "Weekly Site Progress: Week 15 Completed",
  summary: "Great progress this week!...",
  author: "Kwame Okafor",
  field: "Construction",
  interests: ["safety", "construction", "updates"],
  media: [{
    url: "https://images.pexels.com/photos/...",
    mediaType: "image",
    fileName: "construction-image.jpg"
  }],
  stats: {
    likes: 127,
    comments: 23,
    shares: 5,
    follows: 42
  },
  createdAt: "2024-04-22T14:35:00Z",
  demoLabel: "Demo/Simulated",
  demoAuthor: {
    id: "demo_user_0",
    name: "Kwame Okafor",
    role: "Engineer",
    verified: true
  }
}
```

### Construction Industry Content

#### Tags (20 categories)
- Safety & compliance
- Equipment & machinery
- Materials & quality
- Team & recognition
- Planning & timeline
- Inspection & QA
- Progress & milestones
- Industry tips
- Costs & budget
- Sustainability

#### Sample Posts (Topics)
- Weekly site progress updates
- Concrete foundation work
- Safety training announcements
- Material delivery schedules
- Quality control results
- Team achievements
- Regulatory compliance
- Equipment maintenance
- Final inspections

---

## Architecture

```
SimulationContext (Global State)
  ├─ isSimulationMode: boolean
  ├─ simulationPosts: CommunityPost[]
  ├─ getSimulationPosts(): CommunityPost[]
  └─ addSimulationPost(post): void

MockActivityEngine (Real-Time Simulation)
  ├─ onActivity(callback): void
  ├─ onNewPost(callback): void
  ├─ start(): void
  ├─ stop(): void
  └─ destroy(): void

UI Components
  ├─ DemoModeBadge (Fixed header)
  ├─ DemoLabel (Post badge)
  ├─ SimulationSettings (Admin panel)
  └─ PostCard (Enhanced with demo label)

Data Generation
  ├─ mockUsers.ts (150 profiles)
  ├─ mockPosts.ts (150+ posts)
  └─ mockActivityEngine.ts (Real-time updates)
```

---

## Safety & Defaults

### Production Safety
- **Simulation Mode OFF by default** in production
- **No mixed data**: Demo posts namespaced with `demo_*` prefix
- **Clear labeling**: All simulated content marked "Demo/Simulated"
- **Admin-only toggle**: Controlled via settings component

### Namespacing
```
Demo user IDs:     demo_user_0, demo_user_1, ...
Demo post IDs:     demo_post_0, demo_post_1, ...
Demo room IDs:     demo_room_0, demo_room_1, ...
```

### Data Isolation
- Simulation posts filtered by ID prefix in queries
- No interaction with real user data
- Bookmarks/follows tracked separately
- Analytics events tagged with "demo" namespace

---

## Configuration

### Environment Variables
```env
REACT_APP_SIMULATION_MODE=true|false  # Enable/disable on startup
```

### Runtime Toggle
Via SimulationSettings component:
- Accessible from admin panel
- One-click enable/disable
- Real-time feed updates
- Reset functionality

---

## Content Quality

### Authenticity Features
- ✅ Diverse African names from multiple regions
- ✅ Realistic job titles and companies
- ✅ Construction-specific terminology and topics
- ✅ Professional-grade images/videos from Pexels
- ✅ Randomized engagement metrics (realistic ranges)
- ✅ Varied timestamps (last 7 days)
- ✅ Mixed content types (video, image, text, document, audio)
- ✅ Realistic interaction patterns

### Transparency
- ✅ "Demo Mode" badge in header
- ✅ "Demo/Simulated" labels on all posts
- ✅ Amber warning colors for visibility
- ✅ Settings panel clearly explains demo nature
- ✅ No deceptive practices

---

## Future Enhancements

1. **AI-Generated Captions**: Integrate with Claude/GPT for unique captions
2. **Trending Tags**: Dynamic trend calculation
3. **Comment Simulation**: Realistic reply threads
4. **User Interaction History**: Track demo interactions
5. **Performance Profiling**: Monitor simulation overhead
6. **Export/Import**: Save/restore demo states
7. **Custom Scenarios**: Pre-built demo narratives for specific use cases

---

## Testing & Verification

### Verification Checklist
- [ ] DemoModeBadge appears when simulation is ON
- [ ] Demo posts have amber "Demo/Simulated" label
- [ ] Demo posts appear in feed when simulation is ON
- [ ] All demo user names are realistic African names
- [ ] Media URLs are valid Pexels images/videos
- [ ] Engagement counts are reasonable (5-500 range)
- [ ] Timestamps are in last 7 days
- [ ] Demo posts disappear when simulation is OFF
- [ ] SimulationSettings component works correctly
- [ ] Simulation performance is acceptable (<100ms blending)

---

## File Structure

```
frontend/
├── src/
│   ├── contexts/
│   │   └── SimulationContext.tsx
│   ├── lib/
│   │   ├── mockUsers.ts (150 users)
│   │   ├── mockPosts.ts (150+ posts)
│   │   └── mockActivityEngine.ts
│   ├── components/
│   │   └── community/
│   │       ├── DemoModeBadge.tsx
│   │       ├── DemoLabel.tsx
│   │       └── SimulationSettings.tsx
│   └── pages/
│       └── dashboard/
│           ├── community/
│           │   ├── PostCard.tsx (enhanced)
│           │   ├── CommunityLayout.tsx (enhanced)
│           │   └── types.ts (extended)
│           └── CommunityHubV2.tsx (enhanced)
```

---

## Commit Info

**Commit**: d26c2e4
**Message**: feat: Implement comprehensive Simulation Mode for Community platform

### Files Changed
- Created 7 new files
- Modified 5 existing files  
- Added 667 lines of code
- All changes backward compatible

---

## Quick Start

1. **Enable Simulation Mode**:
   - Go to Community tab
   - Open settings
   - Toggle "Enable Simulation Mode"
   - Refresh page

2. **See Demo Content**:
   - Feed shows 150+ realistic construction posts
   - "DEMO MODE" badge visible in top-right
   - Each post shows "Demo/Simulated" amber label
   - Realistic engagement metrics displayed

3. **Explore Features**:
   - Click "Save post" on demo posts
   - Follow/like demo posts
   - View saved posts in activity sidebar
   - Reset posts via SimulationSettings

---

## Contact & Support

For issues or questions about Simulation Mode:
- Check this documentation
- Review SimulationContext implementation
- Verify environment variables are set
- Check browser console for errors
