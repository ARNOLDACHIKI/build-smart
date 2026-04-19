import type { CommunityPost } from '@/lib/community';

/**
 * Mock posts with real, working media URLs for testing and demo purposes.
 * Uses public CDN/sample resources that are freely available.
 */

export const mockPosts: CommunityPost[] = [
  // Use Case 1: Site Documentation with Multiple Images
  {
    id: 'mock-post-1',
    type: 'Site Update',
    title: 'Foundation excavation progress - Phase 2 complete',
    summary:
      'Major excavation phase completed ahead of schedule. Rock breaking and soil removal finished. Foundation ready for concrete pouring next week. Weather conditions have been favorable with minimal delays.',
    author: 'J. Kipchoge',
    field: 'Engineering',
    interests: ['site-updates', 'excavation', 'construction'],
    stats: '342 views • 28 comments',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
        mediaType: 'image',
        fileName: 'foundation_day1.jpg',
      },
      {
        url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80',
        mediaType: 'image',
        fileName: 'foundation_day2.jpg',
      },
      {
        url: 'https://images.unsplash.com/photo-1565182000675-98e440b5f454?w=800&q=80',
        mediaType: 'image',
        fileName: 'foundation_day3.jpg',
      },
    ],
    createdAt: '2026-04-15T08:30:00Z',
  },

  // Use Case 2: Video Walkthrough of Site
  {
    id: 'mock-post-2',
    type: 'Site Walkthrough',
    title: 'Live site walkthrough - Coastal villa project week 3 overview',
    summary:
      'Comprehensive video tour of current site conditions. See structural columns, electrical routing, plumbing layout, and finishing preparations. Duration: 12 minutes. Expert commentary on quality checks and next phases.',
    author: 'M. Adhiambo',
    field: 'Engineering',
    interests: ['video', 'walkthrough', 'residential'],
    stats: '1.2k views • 94 comments',
    media: [
      {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
        mediaType: 'video',
        fileName: 'site_walkthrough_week3.mp4',
      },
    ],
    createdAt: '2026-04-14T14:45:00Z',
  },

  // Use Case 3: Audio Discussion/Podcast
  {
    id: 'mock-post-3',
    type: 'Audio Discussion',
    title: 'Construction best practices podcast - Episode 47: Cost control strategies',
    summary:
      'In-depth discussion on cost management in commercial construction projects. Features expert contractor insights, case studies, and Q&A. Duration: 42 minutes. Key topics: budget tracking, material sourcing, labor efficiency.',
    author: 'BuildSmart Podcast',
    field: 'Project Management',
    interests: ['podcast', 'best-practices', 'cost-control'],
    stats: '486 plays • 22 shares',
    media: [
      {
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        mediaType: 'audio',
        fileName: 'construction_podcast_ep47.mp3',
      },
    ],
    createdAt: '2026-04-12T10:00:00Z',
  },

  // Use Case 4: Mixed Media - Images + Video
  {
    id: 'mock-post-4',
    type: 'Project Showcase',
    title: 'Office tower completion - from groundbreaking to handover in photos & video',
    summary:
      'Time-lapse journey of 18-month commercial office project. Before images, mid-construction checkpoints, and final completion video walkthrough. Featuring sustainable design elements and smart building features.',
    author: 'Construct Kenya',
    field: 'Architecture',
    interests: ['project-showcase', 'commercial', 'sustainability'],
    stats: '2.8k views • 156 comments',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        mediaType: 'image',
        fileName: 'office_tower_construction.jpg',
      },
      {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4',
        mediaType: 'video',
        fileName: 'office_tower_timelapse.mp4',
      },
      {
        url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
        mediaType: 'image',
        fileName: 'office_tower_interior.jpg',
      },
    ],
    createdAt: '2026-04-13T16:20:00Z',
  },

  // Use Case 5: Document Reference with Images
  {
    id: 'mock-post-5',
    type: 'Technical Guide',
    title: 'Reinforced concrete specifications and testing procedures',
    summary:
      'Complete technical specification sheet for structural concrete with compression testing photos. Includes mix design, curing protocols, quality standards, and test result samples. PDF document and reference images included.',
    author: 'Engineering Standards Board',
    field: 'Engineering',
    interests: ['standards', 'concrete', 'quality'],
    stats: '892 downloads • 34 citations',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1581092918077-a2b632c2f8b5?w=800&q=80',
        mediaType: 'image',
        fileName: 'concrete_test_sample.jpg',
      },
      {
        url: 'https://images.unsplash.com/photo-1581092162562-40038f51c1a7?w=800&q=80',
        mediaType: 'image',
        fileName: 'concrete_compression_test.jpg',
      },
    ],
    createdAt: '2026-04-10T09:15:00Z',
  },

  // Use Case 6: Discussion Post with Single Image
  {
    id: 'mock-post-6',
    type: 'Discussion',
    title: 'What are the best practices for managing subcontractor quality on residential projects?',
    summary:
      'Open discussion on subcontractor oversight, quality assurance protocols, and dispute resolution. Share your experience with effective QA methods, documentation systems, and communication strategies that work on residential builds.',
    author: 'P. Omondi',
    field: 'Project Management',
    interests: ['subcontractors', 'quality', 'management'],
    stats: '47 replies • 312 views',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
        mediaType: 'image',
        fileName: 'quality_inspection.jpg',
      },
    ],
    createdAt: '2026-04-11T11:30:00Z',
  },

  // Use Case 7: Multiple Videos
  {
    id: 'mock-post-7',
    type: 'Training Series',
    title: 'Introduction to BIM (Building Information Modeling) - 3-part video series',
    summary:
      'Beginner-friendly BIM training videos covering fundamentals, software overview, and real-world project application. Perfect for contractors and site engineers entering digital construction. Part 1: Basics, Part 2: Tools, Part 3: Workflow.',
    author: 'Digital Construction Academy',
    field: 'Engineering',
    interests: ['bim', 'training', 'digital'],
    stats: '1.8k views • 256 enrollments',
    media: [
      {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4',
        mediaType: 'video',
        fileName: 'bim_training_part1.mp4',
      },
      {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerEscapes.mp4',
        mediaType: 'video',
        fileName: 'bim_training_part2.mp4',
      },
    ],
    createdAt: '2026-04-09T13:00:00Z',
  },

  // Use Case 8: News/Update with Multiple Images
  {
    id: 'mock-post-8',
    type: 'News',
    title: 'New sustainable building materials approved for use in coastal construction projects',
    summary:
      'Industry regulatory update: Three new eco-friendly materials certified for use in coastal environments. Enhanced durability against salt spray, reduced carbon footprint, and cost-competitive pricing. See approved manufacturers and certification documents.',
    author: 'Building Code Authority',
    field: 'Engineering',
    interests: ['standards', 'sustainability', 'materials'],
    stats: '1.1k views • 78 comments',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1581092160562-40038f51c1a7?w=800&q=80',
        mediaType: 'image',
        fileName: 'sustainable_material_1.jpg',
      },
      {
        url: 'https://images.unsplash.com/photo-1581092162562-40038f51c1a7?w=800&q=80',
        mediaType: 'image',
        fileName: 'sustainable_material_2.jpg',
      },
      {
        url: 'https://images.unsplash.com/photo-1581092158692-8644ffc880be?w=800&q=80',
        mediaType: 'image',
        fileName: 'sustainable_material_3.jpg',
      },
      {
        url: 'https://images.unsplash.com/photo-1581092206092-8ce83e32ac34?w=800&q=80',
        mediaType: 'image',
        fileName: 'sustainable_material_4.jpg',
      },
    ],
    createdAt: '2026-04-08T08:45:00Z',
  },

  // Use Case 9: Live Session/Event
  {
    id: 'mock-post-9',
    type: 'Live Session',
    title: 'Weekly contractor Q&A - Site safety, regulations & compliance',
    summary:
      'Join our weekly live discussion with safety inspectors and compliance officers. Real-time Q&A about site safety protocols, regulatory updates, accident prevention, and common violations. This week: Focus on electrical safety and fall prevention.',
    author: 'BuildSmart Academy',
    field: 'Engineering',
    interests: ['safety', 'compliance', 'training'],
    stats: 'Starting in 2 hours • 128 registered',
    liveSession: {
      title: 'Weekly Contractor Q&A - Safety & Compliance',
      startsAt: '2026-04-16T15:00:00Z',
      roomUrl: 'https://meet.google.com/buildsmart-safety-qa',
      roomId: 'room-safety-qa-weekly',
      description: 'Expert panel discussion on site safety, regulations, and compliance best practices.',
    },
    createdAt: '2026-04-16T08:00:00Z',
  },

  // Use Case 10: Mixed Content - Video + Audio + Images
  {
    id: 'mock-post-10',
    type: 'Project Report',
    title: 'Monthly project status - Q1 2026 summary with video walkthrough and audio commentary',
    summary:
      'Comprehensive monthly status report combining site photos from each week, progress video walkthrough, and detailed audio commentary from project manager. Covers budget status, schedule variance, resource allocation, and upcoming milestones.',
    author: 'Project Controls Team',
    field: 'Project Management',
    interests: ['reporting', 'status', 'analysis'],
    stats: '234 views • 12 downloads',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
        mediaType: 'image',
        fileName: 'progress_week1.jpg',
      },
      {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
        mediaType: 'video',
        fileName: 'progress_walkthrough_q1.mp4',
      },
      {
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        mediaType: 'audio',
        fileName: 'project_manager_commentary.mp3',
      },
      {
        url: 'https://images.unsplash.com/photo-1581092916550-e323abad3bbb?w=800&q=80',
        mediaType: 'image',
        fileName: 'progress_week4.jpg',
      },
    ],
    createdAt: '2026-04-07T10:30:00Z',
  },

  // Use Case 11: Simple Text Post (Control/Baseline)
  {
    id: 'mock-post-11',
    type: 'Discussion',
    title: 'Best practices for managing construction timelines during rainy season',
    summary:
      'Sharing insights from our 5-year experience managing projects across different seasons. Key strategies: buffer scheduling, weather monitoring systems, equipment protection, and contingency planning. Looking forward to hearing your approaches and lessons learned.',
    author: 'S. Mwangi',
    field: 'Project Management',
    interests: ['scheduling', 'weather', 'planning'],
    stats: '156 replies • 892 views',
    createdAt: '2026-04-06T09:20:00Z',
  },

  // Use Case 12: Single Image Post
  {
    id: 'mock-post-12',
    type: 'Site Update',
    title: 'Structural steel installation completed ahead of schedule',
    summary:
      'All primary and secondary structural steel members installed and bolted. Quality inspections passed all requirements. Ready for floor deck installation next week. Current status: 2 days ahead of master schedule.',
    author: 'E. Kipchoge',
    field: 'Engineering',
    interests: ['structural', 'steel', 'installation'],
    stats: '78 views • 5 comments',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1504328550336-c27f6a53b62f?w=800&q=80',
        mediaType: 'image',
        fileName: 'structural_steel_installation.jpg',
      },
    ],
    createdAt: '2026-04-05T14:00:00Z',
  },
];
