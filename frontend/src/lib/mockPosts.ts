import type { CommunityPost } from './community';
import { mockUsers } from './mockUsers';

export type MockPostType = 'video' | 'image' | 'text' | 'document' | 'audio' | 'mixed';

const CONSTRUCTION_VIDEO_SOURCES = [
  'https://www.pexels.com/video/1486726/', // Construction site
  'https://www.pexels.com/video/1491796/', // Machinery at work
  'https://www.pexels.com/video/5632622/', // Building progress
  'https://www.pexels.com/video/5632578/', // Site inspection
  'https://www.pexels.com/video/5632603/', // Team coordination
  'https://www.pexels.com/video/5740435/', // Safety briefing
  'https://www.pexels.com/video/5632627/', // Foundation work
  'https://www.pexels.com/video/5632619/', // Concrete pouring
  'https://www.pexels.com/video/5632615/', // Steel framework
  'https://www.pexels.com/video/5632611/', // Finishing touches
];

const CONSTRUCTION_IMAGE_SOURCES = [
  'https://images.pexels.com/photos/3714896/pexels-photo-3714896.jpeg', // Modern building
  'https://images.pexels.com/photos/279737/pexels-photo-279737.jpeg', // Under construction
  'https://images.pexels.com/photos/3661836/pexels-photo-3661836.jpeg', // Blueprints
  'https://images.pexels.com/photos/3807967/pexels-photo-3807967.jpeg', // Building facade
  'https://images.pexels.com/photos/4873098/pexels-photo-4873098.jpeg', // Construction site
  'https://images.pexels.com/photos/354201/pexels-photo-354201.jpeg', // Crane machinery
  'https://images.pexels.com/photos/279737/pexels-photo-279737.jpeg', // Site work
  'https://images.pexels.com/photos/2872867/pexels-photo-2872867.jpeg', // Team discussion
  'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', // Material inspection
  'https://images.pexels.com/photos/3739629/pexels-photo-3739629.jpeg', // Safety gear
  'https://images.pexels.com/photos/3807510/pexels-photo-3807510.jpeg', // Blueprint review
  'https://images.pexels.com/photos/1438761/pexels-photo-1438761.jpeg', // Architectural design
  'https://images.pexels.com/photos/3807568/pexels-photo-3807568.jpeg', // Construction planning
  'https://images.pexels.com/photos/3771469/pexels-photo-3771469.jpeg', // Heavy machinery
  'https://images.pexels.com/photos/2541310/pexels-photo-2541310.jpeg', // Building entrance
  'https://images.pexels.com/photos/4194810/pexels-photo-4194810.jpeg', // Office building
  'https://images.pexels.com/photos/3845683/pexels-photo-3845683.jpeg', // Residential building
  'https://images.pexels.com/photos/4194804/pexels-photo-4194804.jpeg', // Commercial complex
  'https://images.pexels.com/photos/3944387/pexels-photo-3944387.jpeg', // Foundation laying
  'https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg', // Beam installation
];

const CONSTRUCTION_TITLES = [
  'Weekly Site Progress: Week 15 Completed',
  'Concrete Foundation Pour Underway',
  'Safety Training Session - All Staff Required',
  'New Material Delivery Schedule',
  'Q&A: Best Practices for Rebar Installation',
  'Site Photos: Structural Steel Framework',
  'Project Milestone: 50% Completion',
  'Tips: Efficient Excavation Techniques',
  'Equipment Maintenance Report',
  'Team Spotlight: Outstanding Safety Record',
  'Building Inspection Results',
  'Weather Impact Analysis - Next 2 Weeks',
  'Supplier Updates: Portland Cement Quality',
  'Worker Recognition: Outstanding Craftsmanship',
  'Regulatory Compliance Checklist',
  'Site Coordination Meeting Summary',
  'Material Cost Review & Budget Status',
  'New Tools Available at Site',
  'Waste Management Best Practices',
  'Final Inspection Preparations',
];

const CONSTRUCTION_CAPTIONS = [
  'Great progress this week! The team has done exceptional work despite challenging weather conditions.',
  'Our concrete foundation pour went smoothly with no issues. Quality control passed all tests.',
  'Reminder: All staff must attend the mandatory safety training next Tuesday.',
  'New batch of materials just arrived. All shipments checked and stored as per protocol.',
  'Discussing the latest industry standards for steel reinforcement. Great Q&A session!',
  'Beautiful photos from our structural steel installation. Precision and quality at its best.',
  'We\'ve reached the 50% completion mark! Thanks to everyone\'s dedication and hard work.',
  'Sharing some proven techniques for faster and safer excavation work. Industry standard stuff.',
  'Monthly equipment maintenance completed. All machinery certified and ready to go.',
  'Special recognition to the team for maintaining a zero-incident safety record this quarter.',
  'Final building inspection conducted. Only minor adjustments needed before handover.',
  'Weather forecast shows potential rain next week. Preparing protection measures.',
  'Our new Portland Cement supplier has excellent quality ratings. Switching batches now.',
  'Huge congratulations to our team for outstanding craftsmanship on the finishing work.',
  'Annual compliance audit completed successfully. Documentation updated and filed.',
  'Site coordination today focused on next phase timeline and resource allocation.',
  'Budget review shows we\'re on track. Material costs slightly down from projections.',
  'New digital tools available to all site staff. Training session scheduled for Friday.',
  'Implementing new waste reduction program. Everyone must follow the new sorting guidelines.',
  'Pre-handover inspection scheduled. Final touches and quality assurance in progress.',
];

const TAGS_CONSTRUCTION = [
  ['safety', 'construction', 'updates'],
  ['equipment', 'machinery', 'maintenance'],
  ['concrete', 'materials', 'quality'],
  ['team', 'recognition', 'excellence'],
  ['planning', 'scheduling', 'timeline'],
  ['compliance', 'regulatory', 'standards'],
  ['progress', 'milestone', 'achievement'],
  ['tips', 'best-practices', 'industry'],
  ['inspection', 'qa', 'testing'],
  ['budget', 'costs', 'efficiency'],
  ['weather', 'planning', 'risks'],
  ['steel', 'framework', 'structure'],
  ['excavation', 'foundation', 'groundwork'],
  ['finishing', 'details', 'quality'],
  ['coordination', 'teamwork', 'communication'],
  ['supplier', 'materials', 'delivery'],
  ['safety-training', 'compliance', 'mandatory'],
  ['site-photos', 'documentation', 'progress'],
  ['waste-management', 'sustainability', 'environment'],
  ['handover', 'final-inspection', 'closeout'],
];

const generateTimestamp = (minutesAgo: number) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutesAgo);
  return date.toISOString();
};

const getRelativeTime = (minutesAgo: number): string => {
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo}h ago`;
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 7) return `${daysAgo}d ago`;
  const weeksAgo = Math.floor(daysAgo / 7);
  return `${weeksAgo}w ago`;
};

export const generateMockPost = (index: number): CommunityPost => {
  const user = mockUsers[index % mockUsers.length];
  const minutesAgo = Math.floor(Math.random() * 10080); // Last 7 days
  const postType: MockPostType[] = ['video', 'image', 'text', 'document', 'audio', 'mixed'];
  const type = postType[Math.floor(Math.random() * postType.length)];

  const titleIndex = index % CONSTRUCTION_TITLES.length;
  const captionIndex = index % CONSTRUCTION_CAPTIONS.length;
  const tagsIndex = index % TAGS_CONSTRUCTION.length;

  const media: any[] = [];
  if (type === 'video' || type === 'mixed') {
    media.push({
      url: `https://www.pexels.com/videos/${1486726 + (index % 10)}/`,
      mediaType: 'video' as const,
      fileName: `construction-video-${index}.mp4`,
      thumbnailUrl: CONSTRUCTION_IMAGE_SOURCES[index % CONSTRUCTION_IMAGE_SOURCES.length],
    });
  }
  if (type === 'image' || type === 'mixed') {
    media.push({
      url: CONSTRUCTION_IMAGE_SOURCES[index % CONSTRUCTION_IMAGE_SOURCES.length],
      mediaType: 'image' as const,
      fileName: `construction-image-${index}.jpg`,
    });
  }

  const stats = {
    likes: Math.floor(Math.random() * 500) + 5,
    comments: Math.floor(Math.random() * 50) + 2,
    shares: Math.floor(Math.random() * 30),
    follows: Math.floor(Math.random() * 100),
  };

  return {
    id: `demo_post_${index}`,
    type: 'Article',
    title: CONSTRUCTION_TITLES[titleIndex],
    summary: CONSTRUCTION_CAPTIONS[captionIndex],
    author: user.name,
    field: 'Construction',
    interests: TAGS_CONSTRUCTION[tagsIndex],
    media: media.length > 0 ? media : undefined,
    stats,
    verified: user.verified,
    createdAt: generateTimestamp(minutesAgo),
    liveSession: index % 25 === 0 ? { roomId: `demo_room_${index}`, title: 'Live Site Walkthrough' } : undefined,
    engagement: {
      likes: stats.likes,
      comments: stats.comments,
      follows: stats.follows,
      showLikes: true,
      showComments: true,
      showFollows: true,
    },
    canDelete: false,
    demoLabel: 'Demo/Simulated',
    demoAuthor: user,
  };
};

export const generateMockPosts = (count: number): CommunityPost[] => {
  const posts: CommunityPost[] = [];
  for (let i = 0; i < count; i++) {
    try {
      posts.push(generateMockPost(i));
    } catch (error) {
      console.error(`Error generating mock post ${i}:`, error);
    }
  }
  return posts;
};

// Generate 150 diverse mock posts
export const mockPosts = generateMockPosts(150);
