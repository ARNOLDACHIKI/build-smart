import type { CommunityPost } from '@/lib/community';

/**
 * Expanded mock posts covering diverse construction scenarios.
 * All URLs are real, public, and tested for functionality.
 */

export const expandedMockPosts: CommunityPost[] = [
  // FOUNDATION & EXCAVATION
  {
    id: 'post-foundation-1',
    type: 'Site Update',
    title: 'Foundation excavation phase 2 complete - ahead of schedule',
    summary: 'Rock breaking and soil removal finished. Foundation bed prepared for concrete pouring. Favorable weather conditions contributed to early completion.',
    author: 'J. Kipchoge',
    field: 'Engineering',
    interests: ['excavation', 'foundation', 'site-update'],
    stats: '342 views • 28 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=101', mediaType: 'image', fileName: 'excavation_1.jpg' },
      { url: 'https://picsum.photos/800/600?random=102', mediaType: 'image', fileName: 'excavation_2.jpg' },
      { url: 'https://picsum.photos/800/600?random=103', mediaType: 'image', fileName: 'excavation_3.jpg' },
    ],
    createdAt: '2026-04-15T08:30:00Z',
  },

  {
    id: 'post-concrete-1',
    type: 'Site Video',
    title: 'Concrete pouring day 1 - Foundation slabs coverage 65%',
    summary: 'Real-time view of concrete pouring operations. 450 cubic meters poured in first 8 hours. Excellent quality control with continuous slump testing.',
    author: 'M. Adhiambo',
    field: 'Engineering',
    interests: ['concrete', 'video', 'construction'],
    stats: '1.2k views • 94 comments',
    media: [
      { url: 'https://www.w3schools.com/html/mov_bbb.mp4', mediaType: 'video', fileName: 'concrete_pour.mp4' },
    ],
    createdAt: '2026-04-14T14:45:00Z',
  },

  // STEEL & STRUCTURAL
  {
    id: 'post-steel-1',
    type: 'Installation Update',
    title: 'Structural steel erection - Columns 1-24 completed',
    summary: 'Major column installation milestone achieved. 48-hour continuous operation. All bolted connections inspected and certified. Ready for beam placement.',
    author: 'E. Kipchoge',
    field: 'Engineering',
    interests: ['steel', 'structural', 'installation'],
    stats: '892 views • 67 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=104', mediaType: 'image', fileName: 'steel_columns.jpg' },
      { url: 'https://picsum.photos/800/600?random=105', mediaType: 'image', fileName: 'steel_bolts.jpg' },
    ],
    createdAt: '2026-04-13T09:15:00Z',
  },

  // SAFETY & COMPLIANCE
  {
    id: 'post-safety-1',
    type: 'Training',
    title: 'Safety briefing - Working at heights certification training',
    summary: '45-minute certification training for all site personnel. Topics: harness fitting, anchor points, rescue procedures. 89 participants completed module.',
    author: 'Safety Officer K. Mwangi',
    field: 'Engineering',
    interests: ['safety', 'training', 'compliance'],
    stats: '234 plays • 12 comments',
    media: [
      { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', mediaType: 'audio', fileName: 'safety_training_audio.mp3' },
    ],
    createdAt: '2026-04-12T10:00:00Z',
  },

  {
    id: 'post-safety-2',
    type: 'Site Safety',
    title: '7-day safety record milestone - Zero incidents achieved',
    summary: 'Entire site completed one full week without any safety incidents or near-misses. Recognition for all team members and supervisors maintaining excellent protocols.',
    author: 'Project Safety Director',
    field: 'Engineering',
    interests: ['safety', 'milestone', 'recognition'],
    stats: '567 views • 89 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=106', mediaType: 'image', fileName: 'safety_award.jpg' },
    ],
    createdAt: '2026-04-11T16:30:00Z',
  },

  // ELECTRICAL & MEP
  {
    id: 'post-electrical-1',
    type: 'Trade Installation',
    title: 'Electrical rough-in installation - 40% completion across 8 floors',
    summary: '2,400 meters of conduit installed. 890 electrical boxes positioned. Coordination with MEP trades on schedule to avoid clashes.',
    author: 'Electrical Contractor P. Ochieng',
    field: 'Engineering',
    interests: ['electrical', 'mep', 'installation'],
    stats: '156 views • 22 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=107', mediaType: 'image', fileName: 'electrical_installation.jpg' },
      { url: 'https://picsum.photos/800/600?random=108', mediaType: 'image', fileName: 'conduit_routing.jpg' },
    ],
    createdAt: '2026-04-10T11:20:00Z',
  },

  {
    id: 'post-plumbing-1',
    type: 'Trade Installation',
    title: 'Plumbing system pressure test - All systems passed certification',
    summary: '850mm of main water lines tested at 1.5x design pressure. Zero failures. Domestic hot water circulation verified at all fixture points.',
    author: 'Plumbing Supervisor',
    field: 'Engineering',
    interests: ['plumbing', 'testing', 'certification'],
    stats: '89 views • 8 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=109', mediaType: 'image', fileName: 'plumbing_test.jpg' },
    ],
    createdAt: '2026-04-09T13:45:00Z',
  },

  // MATERIALS & EQUIPMENT
  {
    id: 'post-materials-1',
    type: 'Material Delivery',
    title: 'Ceramic tiles and fixtures delivery - 4,200 sq meters received',
    summary: 'Complete bathroom & kitchen tile shipment arrived. All units inspected for factory defects. Stored in climate-controlled facility pending installation phase.',
    author: 'Materials Manager D. Kariuki',
    field: 'Project Management',
    interests: ['materials', 'delivery', 'logistics'],
    stats: '234 views • 15 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=110', mediaType: 'image', fileName: 'tiles_delivery.jpg' },
    ],
    createdAt: '2026-04-08T08:00:00Z',
  },

  {
    id: 'post-equipment-1',
    type: 'Equipment Review',
    title: 'New tower crane performance review - 45-ton capacity model exceeds expectations',
    summary: 'Testimonial from equipment operator. Precision hoisting at 2.2m/min. Fuel efficiency 12% better than previous model. Recommend for future projects.',
    author: 'Site Equipment Manager',
    field: 'Engineering',
    interests: ['equipment', 'review', 'performance'],
    stats: '567 views • 42 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=111', mediaType: 'image', fileName: 'crane_operation.jpg' },
      { url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', mediaType: 'video', fileName: 'crane_demo.mp4' },
    ],
    createdAt: '2026-04-07T14:30:00Z',
  },

  // WEATHER & ENVIRONMENTAL
  {
    id: 'post-weather-1',
    type: 'Environmental',
    title: 'Rainfall tracking during monsoon - Site drainage performance review',
    summary: 'Heavy rainfall event (120mm in 6 hours). All drainage systems functioned perfectly. Zero water ingress into structure. Environmental controls exceeded expectations.',
    author: 'Site Environmental Officer',
    field: 'Engineering',
    interests: ['weather', 'environmental', 'drainage'],
    stats: '289 views • 18 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=112', mediaType: 'image', fileName: 'weather_monitoring.jpg' },
    ],
    createdAt: '2026-04-06T09:45:00Z',
  },

  // COMPLIANCE & INSPECTIONS
  {
    id: 'post-inspection-1',
    type: 'Inspection Report',
    title: 'Municipal inspection passed - Foundation phase certification complete',
    summary: 'Official municipal inspector certification for foundation phase. Report PDF: Zero defects noted. Approved to proceed to next phase. Valid for 30 days.',
    author: 'Project Manager',
    field: 'Project Management',
    interests: ['inspection', 'compliance', 'certification'],
    stats: '445 views • 34 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=113', mediaType: 'image', fileName: 'inspection_report.jpg' },
    ],
    createdAt: '2026-04-05T10:15:00Z',
  },

  // TEAM SPOTLIGHTS
  {
    id: 'post-team-1',
    type: 'Team Spotlight',
    title: 'Team of the month - Concrete crew achieves record pour rate',
    summary: '450 cubic meters in single 8-hour shift. Recognition to 12-person concrete crew for precision, safety, and efficiency. Zero waste, Zero defects.',
    author: 'Site Director',
    field: 'Project Management',
    interests: ['team', 'recognition', 'excellence'],
    stats: '892 views • 78 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=114', mediaType: 'image', fileName: 'team_photo.jpg' },
    ],
    createdAt: '2026-04-04T15:00:00Z',
  },

  // COST & SCHEDULE
  {
    id: 'post-budget-1',
    type: 'Project Control',
    title: 'Q1 2026 financial report - Under budget 3.2%, Schedule ahead 2.8%',
    summary: 'Excellent cost control across all trades. Material costs optimized through early procurement. Labor efficiency improved 15% through better planning.',
    author: 'Project Controls',
    field: 'Project Management',
    interests: ['budget', 'schedule', 'control'],
    stats: '234 views • 12 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=115', mediaType: 'image', fileName: 'budget_report.jpg' },
    ],
    createdAt: '2026-04-03T11:30:00Z',
  },

  // INNOVATION & TECHNOLOGY
  {
    id: 'post-tech-1',
    type: 'Innovation',
    title: 'Implementation of drone surveying - 3D BIM model accuracy ±2cm',
    summary: 'Weekly drone surveys generate point clouds. Real-time progress tracking. Coordination issues detected 2 weeks earlier than traditional methods.',
    author: 'BIM Coordinator',
    field: 'Engineering',
    interests: ['technology', 'bim', 'innovation'],
    stats: '1.2k views • 94 comments',
    media: [
      { url: 'https://www.w3schools.com/html/mov_bbb.mp4', mediaType: 'video', fileName: 'drone_survey.mp4' },
    ],
    createdAt: '2026-04-02T13:20:00Z',
  },

  // ADDITIONAL DIVERSE POSTS
  {
    id: 'post-quality-1',
    type: 'Quality Assurance',
    title: 'Quality control process - Third-party testing of precast panels',
    summary: 'Dimensional verification of 240 precast concrete panels. 100% passed compression tests. Finish quality exceeds architect specifications.',
    author: 'Quality Manager',
    field: 'Engineering',
    interests: ['quality', 'testing', 'precast'],
    stats: '156 views • 21 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=116', mediaType: 'image', fileName: 'quality_test.jpg' },
    ],
    createdAt: '2026-04-01T09:00:00Z',
  },

  {
    id: 'post-hvac-1',
    type: 'MEP Installation',
    title: 'HVAC ductwork installation - Air distribution across 12 zones',
    summary: 'Spiral ductwork installation for main air handling units. Air balance testing scheduled for next week. All fire-rated dampers installed and certified.',
    author: 'HVAC Supervisor',
    field: 'Engineering',
    interests: ['hvac', 'mep', 'ductwork'],
    stats: '123 views • 14 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=117', mediaType: 'image', fileName: 'hvac_install.jpg' },
    ],
    createdAt: '2026-03-31T14:15:00Z',
  },

  {
    id: 'post-finishes-1',
    type: 'Finishes',
    title: 'Interior finishes selection - Paint colors and flooring materials approved',
    summary: 'Architect final review of selected interior finishes. 8 paint colors, 12 flooring options, 6 wall treatments approved. Samples delivered from suppliers.',
    author: 'Interior Designer',
    field: 'Architecture',
    interests: ['finishes', 'design', 'materials'],
    stats: '445 views • 67 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=118', mediaType: 'image', fileName: 'finishes_sample.jpg' },
      { url: 'https://picsum.photos/800/600?random=119', mediaType: 'image', fileName: 'flooring_sample.jpg' },
    ],
    createdAt: '2026-03-30T10:45:00Z',
  },

  {
    id: 'post-landscape-1',
    type: 'Landscaping',
    title: 'Site landscaping design - Native plant selection and layout',
    summary: 'Landscape architect finalized native species for hardscape zones. 450 trees, 2,200 shrubs, 8,900 flowering plants selected. Sustainable water management design.',
    author: 'Landscape Designer',
    field: 'Architecture',
    interests: ['landscaping', 'sustainability', 'design'],
    stats: '678 views • 54 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=120', mediaType: 'image', fileName: 'landscape_design.jpg' },
    ],
    createdAt: '2026-03-29T12:00:00Z',
  },

  {
    id: 'post-facade-1',
    type: 'Facade Installation',
    title: 'Curtain wall installation - Glass panels 1-480 installed and sealed',
    summary: 'Exterior glass curtain wall 85% complete. 1,440 aluminum mullions. 480 tempered glass panels installed. Air tightness testing scheduled.',
    author: 'Facade Contractor',
    field: 'Engineering',
    interests: ['facade', 'glass', 'curtainwall'],
    stats: '523 views • 41 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=121', mediaType: 'image', fileName: 'facade_install1.jpg' },
      { url: 'https://picsum.photos/800/600?random=122', mediaType: 'image', fileName: 'facade_install2.jpg' },
    ],
    createdAt: '2026-03-28T15:30:00Z',
  },

  {
    id: 'post-fire-system-1',
    type: 'Safety Systems',
    title: 'Fire detection and suppression system - Full integration testing completed',
    summary: 'Automatic fire sprinkler system tested across all 12 floors. Response time <60 seconds. Water pressure maintained at 8 bar. Certification obtained.',
    author: 'Fire Safety Systems',
    field: 'Engineering',
    interests: ['fire-safety', 'systems', 'testing'],
    stats: '389 views • 28 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=123', mediaType: 'image', fileName: 'fire_system.jpg' },
    ],
    createdAt: '2026-03-27T09:20:00Z',
  },

  {
    id: 'post-accessibility-1',
    type: 'Compliance',
    title: 'Accessibility audit - ADA compliance verification across all public areas',
    summary: 'Third-party accessibility specialist reviewed all public spaces. 100% compliant with ADA standards. Accessible ramps, elevators, restrooms verified.',
    author: 'Compliance Officer',
    field: 'Project Management',
    interests: ['accessibility', 'compliance', 'ada'],
    stats: '234 views • 17 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=124', mediaType: 'image', fileName: 'accessibility_audit.jpg' },
    ],
    createdAt: '2026-03-26T11:45:00Z',
  },

  {
    id: 'post-parking-1',
    type: 'Infrastructure',
    title: 'Underground parking structure - Excavation and shoring complete',
    summary: '450 parking spaces. 3-level structure excavated. Diaphragm walls installed and waterproofed. Ready for structural concrete placement.',
    author: 'Parking Structure Contractor',
    field: 'Engineering',
    interests: ['parking', 'infrastructure', 'excavation'],
    stats: '167 views • 12 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=125', mediaType: 'image', fileName: 'parking_structure.jpg' },
    ],
    createdAt: '2026-03-25T13:15:00Z',
  },

  {
    id: 'post-traffic-1',
    type: 'Logistics',
    title: 'Traffic management plan revision - Reduced site access points',
    summary: 'Updated TMP reduces peak hour vehicle movements 30%. Single entry/exit point improves security. Dedicated material staging area prevents congestion.',
    author: 'Site Logistics Manager',
    field: 'Project Management',
    interests: ['logistics', 'traffic', 'planning'],
    stats: '198 views • 14 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=126', mediaType: 'image', fileName: 'site_access.jpg' },
    ],
    createdAt: '2026-03-24T10:30:00Z',
  },

  {
    id: 'post-waste-1',
    type: 'Sustainability',
    title: 'Waste management audit - 76% material recycling achieved',
    summary: 'Construction waste segregation program resulted in 450 tons recycled material. Concrete, steel, and wood diverted from landfill. Cost savings $23,400.',
    author: 'Sustainability Coordinator',
    field: 'Project Management',
    interests: ['sustainability', 'waste', 'recycling'],
    stats: '312 views • 29 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=127', mediaType: 'image', fileName: 'recycling_program.jpg' },
    ],
    createdAt: '2026-03-23T14:00:00Z',
  },

  {
    id: 'post-energy-1',
    type: 'Sustainability',
    title: 'Energy-efficient systems installation - Solar panels and LED lighting',
    summary: 'Installation of 580 kW solar array across roof surfaces. 8,400 LED fixtures throughout building. Combined system projected to reduce energy costs 45%.',
    author: 'Sustainability Engineer',
    field: 'Engineering',
    interests: ['energy', 'solar', 'sustainability'],
    stats: '567 views • 45 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=128', mediaType: 'image', fileName: 'solar_panels.jpg' },
    ],
    createdAt: '2026-03-22T09:15:00Z',
  },

  {
    id: 'post-water-1',
    type: 'Systems',
    title: 'Water harvesting system - Rainwater collection and treatment',
    summary: '125,000-liter underground cistern for rainwater storage. Treatment system filters to potable standards. Reduces municipal water consumption 35%.',
    author: 'Mechanical Engineer',
    field: 'Engineering',
    interests: ['water', 'sustainability', 'systems'],
    stats: '289 views • 22 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=129', mediaType: 'image', fileName: 'water_system.jpg' },
    ],
    createdAt: '2026-03-21T12:45:00Z',
  },

  {
    id: 'post-roofing-1',
    type: 'Roofing',
    title: 'Roofing installation - Membrane application across 4,500 sq meters',
    summary: '4,500 sq meter roof deck waterproofing complete. TPO membrane installed with full mechanical attachment. Thermal imaging verified complete coverage.',
    author: 'Roofing Contractor',
    field: 'Engineering',
    interests: ['roofing', 'waterproofing', 'installation'],
    stats: '145 views • 9 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=130', mediaType: 'image', fileName: 'roofing_install.jpg' },
    ],
    createdAt: '2026-03-20T15:20:00Z',
  },

  {
    id: 'post-doors-1',
    type: 'Installation',
    title: 'Interior door installation - 340 doors hung and hardware installed',
    summary: 'All interior doors hung, hardware installed, and tested for operation. 340 units across 12 stories. Final adjustments and finishing in progress.',
    author: 'Installation Supervisor',
    field: 'Engineering',
    interests: ['doors', 'hardware', 'installation'],
    stats: '98 views • 6 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=131', mediaType: 'image', fileName: 'doors_install.jpg' },
    ],
    createdAt: '2026-03-19T10:00:00Z',
  },

  {
    id: 'post-design-review-1',
    type: 'Meeting',
    title: 'Design review meeting - MEP coordinated sections approved',
    summary: 'Weekly coordination meeting reviewed 45 architectural sections. All MEP trades present. 12 minor clashes identified and resolved same day.',
    author: 'Project Architect',
    field: 'Architecture',
    interests: ['coordination', 'design', 'meeting'],
    stats: '176 views • 11 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=132', mediaType: 'image', fileName: 'design_meeting.jpg' },
    ],
    createdAt: '2026-03-18T14:30:00Z',
  },

  {
    id: 'post-sustainability-index-1',
    type: 'Certification',
    title: 'LEED green building certification - Path to platinum status',
    summary: 'Project tracking toward LEED Platinum (95+ points). Current progress: 87 points earned. Water efficiency, energy, and sustainable sites exceeding targets.',
    author: 'LEED Coordinator',
    field: 'Project Management',
    interests: ['sustainability', 'leed', 'certification'],
    stats: '423 views • 38 comments',
    media: [
      { url: 'https://picsum.photos/800/600?random=133', mediaType: 'image', fileName: 'leed_status.jpg' },
    ],
    createdAt: '2026-03-17T11:00:00Z',
  },

  {
    id: 'post-article-1',
    type: 'Article',
    title: 'Article: Choosing reinforced concrete mix for coastal construction',
    summary: 'Technical article covering chloride resistance, admixture selection, and QA sampling strategies for marine-facing structures.',
    author: 'Lead Materials Engineer',
    field: 'Engineering',
    interests: ['article', 'concrete', 'materials'],
    stats: '641 reads • 38 comments',
    media: [
      { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', mediaType: 'document', fileName: 'coastal_concrete_article.pdf' },
      { url: 'https://picsum.photos/800/600?random=134', mediaType: 'image', fileName: 'concrete_lab.jpg' },
    ],
    createdAt: '2026-03-16T08:40:00Z',
  },

  {
    id: 'post-video-2',
    type: 'Site Video',
    title: 'Tower crane lift choreography for steel truss placement',
    summary: 'Multi-trade lift coordination sequence with rigging checks, exclusion zones, and signal protocol review.',
    author: 'Lifting Supervisor',
    field: 'Engineering',
    interests: ['video', 'steel', 'crane'],
    stats: '1.6k plays • 112 comments',
    media: [
      { url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', mediaType: 'video', fileName: 'steel_truss_lift.mp4' },
    ],
    createdAt: '2026-03-15T12:10:00Z',
  },

  {
    id: 'post-podcast-1',
    type: 'Podcast',
    title: 'Podcast: Night shift safety and fatigue management on high-rise projects',
    summary: 'Site leadership discussion on shift handovers, incident prevention habits, and practical scheduling improvements.',
    author: 'Safety Program Office',
    field: 'Project Management',
    interests: ['podcast', 'safety', 'night-shift'],
    stats: '389 listens • 47 comments',
    media: [
      { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', mediaType: 'audio', fileName: 'night_shift_safety_podcast.mp3' },
    ],
    createdAt: '2026-03-14T18:20:00Z',
  },

  {
    id: 'post-article-2',
    type: 'Method Statement',
    title: 'Temporary works method statement for retaining wall sequence',
    summary: 'Detailed method statement with excavation sequencing, tieback installation, and emergency controls.',
    author: 'Temporary Works Engineer',
    field: 'Engineering',
    interests: ['method-statement', 'retaining-wall', 'document'],
    stats: '278 reads • 19 comments',
    media: [
      { url: 'https://www.africau.edu/images/default/sample.pdf', mediaType: 'document', fileName: 'retaining_wall_method_statement.pdf' },
    ],
    createdAt: '2026-03-13T07:35:00Z',
  },

  {
    id: 'post-mixed-2',
    type: 'Mixed Media Update',
    title: 'Facade mockup test bay: video walkthrough, snag list, and punch-close photos',
    summary: 'Composite post with inspection walkthrough video, close-out notes, and final corrected panel imagery.',
    author: 'Facade QA Team',
    field: 'Engineering',
    interests: ['facade', 'qa', 'mixed-media'],
    stats: '972 views • 83 comments',
    media: [
      { url: 'https://www.w3schools.com/html/mov_bbb.mp4', mediaType: 'video', fileName: 'facade_walkthrough.mp4' },
      { url: 'https://picsum.photos/800/600?random=135', mediaType: 'image', fileName: 'facade_mockup.jpg' },
      { url: 'https://picsum.photos/800/600?random=136', mediaType: 'image', fileName: 'panel_closeout.jpg' },
    ],
    createdAt: '2026-03-12T16:05:00Z',
  },

  {
    id: 'post-audio-2',
    type: 'Toolbox Talk',
    title: 'Audio toolbox talk: confined space entry controls',
    summary: 'Recorded toolbox talk for permit checks, atmospheric testing, and standby rescue protocol.',
    author: 'HSE Lead',
    field: 'Engineering',
    interests: ['audio', 'toolbox-talk', 'hse'],
    stats: '211 plays • 15 comments',
    media: [
      { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', mediaType: 'audio', fileName: 'confined_space_toolbox_talk.mp3' },
      { url: 'https://picsum.photos/800/600?random=137', mediaType: 'image', fileName: 'confined_space_team.jpg' },
    ],
    createdAt: '2026-03-11T06:50:00Z',
  },

  {
    id: 'post-article-3',
    type: 'Article',
    title: 'Article: Waterproofing failures and how to catch them before handover',
    summary: 'Lessons learned from five projects, including substrate prep, membrane detailing, and flood test documentation.',
    author: 'Commissioning Manager',
    field: 'Project Management',
    interests: ['article', 'waterproofing', 'handover'],
    stats: '503 reads • 31 comments',
    media: [
      { url: 'https://www.orimi.com/pdf-test.pdf', mediaType: 'document', fileName: 'waterproofing_lessons.pdf' },
      { url: 'https://picsum.photos/800/600?random=138', mediaType: 'image', fileName: 'roof_inspection.jpg' },
    ],
    createdAt: '2026-03-10T13:25:00Z',
  },

  {
    id: 'post-video-3',
    type: 'Progress Video',
    title: 'Interior fit-out sprint update: week 11 timelapse',
    summary: 'Timelapse showing partitioning, first-fix MEP, and ceiling grid progression across three levels.',
    author: 'Fit-out Coordinator',
    field: 'Engineering',
    interests: ['video', 'fit-out', 'timelapse'],
    stats: '1.1k views • 64 comments',
    media: [
      { url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', mediaType: 'video', fileName: 'fitout_timelapse.mp4' },
      { url: 'https://picsum.photos/800/600?random=139', mediaType: 'image', fileName: 'interior_fitout.jpg' },
    ],
    createdAt: '2026-03-09T20:15:00Z',
  },

  {
    id: 'post-podcast-2',
    type: 'Podcast',
    title: 'Podcast: Procurement strategy when steel prices fluctuate',
    summary: 'Commercial and engineering teams explain framework agreements, alternates, and schedule risk buffers.',
    author: 'Commercial Manager',
    field: 'Project Management',
    interests: ['podcast', 'procurement', 'steel'],
    stats: '452 listens • 29 comments',
    media: [
      { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', mediaType: 'audio', fileName: 'steel_procurement_podcast.mp3' },
    ],
    createdAt: '2026-03-08T17:00:00Z',
  },

  {
    id: 'post-article-4',
    type: 'Site Bulletin',
    title: 'Weekly quality bulletin: rebar cover nonconformities and corrective action',
    summary: 'Bulletin includes inspection photos, root causes, and corrected bar spacing checklist for all crews.',
    author: 'QA/QC Office',
    field: 'Engineering',
    interests: ['quality', 'rebar', 'bulletin'],
    stats: '327 reads • 23 comments',
    media: [
      { url: 'https://www.africau.edu/images/default/sample.pdf', mediaType: 'document', fileName: 'weekly_quality_bulletin.pdf' },
      { url: 'https://picsum.photos/800/600?random=140', mediaType: 'image', fileName: 'rebar_inspection.jpg' },
    ],
    createdAt: '2026-03-07T09:30:00Z',
  },

  {
    id: 'post-video-4',
    type: 'Commissioning Video',
    title: 'Generator synchronization and backup power commissioning test',
    summary: 'Commissioning team demonstrates load transfer testing and emergency power startup sequence.',
    author: 'Commissioning Engineer',
    field: 'Engineering',
    interests: ['commissioning', 'video', 'power'],
    stats: '764 views • 51 comments',
    media: [
      { url: 'https://www.w3schools.com/html/mov_bbb.mp4', mediaType: 'video', fileName: 'backup_power_test.mp4' },
    ],
    createdAt: '2026-03-06T15:45:00Z',
  },

  // NEW VIDEO-FOCUSED CONTENT
  {
    id: 'post-video-concrete-timelapse',
    type: 'Site Video',
    title: '24-hour concrete curing timelapse - Foundation slab progression',
    summary: 'Complete timelapse of concrete slab curing from initial pour to 24-hour hardening. Multiple camera angles show progression and quality control.',
    author: 'Site Manager',
    field: 'Engineering',
    interests: ['video', 'timelapse', 'concrete'],
    stats: '2.3k views • 156 comments',
    media: [
      { url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', mediaType: 'video', fileName: 'concrete_curing_24h.mp4' },
    ],
    createdAt: '2026-04-16T08:00:00Z',
  },

  {
    id: 'post-video-steel-assembly',
    type: 'Construction Video',
    title: 'Steel frame assembly choreography - Column to beam connection details',
    summary: 'Detailed video showing precise positioning, bolt tightening sequence, and quality verification of 45 major connections.',
    author: 'Steel Foreman',
    field: 'Engineering',
    interests: ['video', 'steel', 'assembly'],
    stats: '1.8k views • 134 comments',
    media: [
      { url: 'https://www.w3schools.com/html/mov_bbb.mp4', mediaType: 'video', fileName: 'steel_assembly_details.mp4' },
    ],
    createdAt: '2026-04-15T10:30:00Z',
  },

  {
    id: 'post-video-mep-rough-in',
    type: 'Trade Video',
    title: 'MEP systems rough-in walkthrough - Electrical, plumbing, HVAC coordination',
    summary: 'Full walkthrough of the rough-in phase showing coordination between three major trades in confined ceiling spaces.',
    author: 'MEP Coordinator',
    field: 'Engineering',
    interests: ['video', 'mep', 'coordination'],
    stats: '1.5k views • 98 comments',
    media: [
      { url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', mediaType: 'video', fileName: 'mep_roughin_walkthrough.mp4' },
    ],
    createdAt: '2026-04-14T14:00:00Z',
  },

  {
    id: 'post-video-formwork-removal',
    type: 'Site Update',
    title: 'Post-tensioned deck formwork removal - Real-time stress monitoring',
    summary: 'Complete timelapse of formwork removal with stress testing equipment showing load transfer to permanent supports.',
    author: 'Structural Engineer',
    field: 'Engineering',
    interests: ['video', 'formwork', 'concrete'],
    stats: '2.1k views • 142 comments',
    media: [
      { url: 'https://www.w3schools.com/html/mov_bbb.mp4', mediaType: 'video', fileName: 'formwork_removal_timelapse.mp4' },
      { url: 'https://picsum.photos/800/600?random=141', mediaType: 'image', fileName: 'stress_monitoring.jpg' },
    ],
    createdAt: '2026-04-13T13:15:00Z',
  },

  {
    id: 'post-video-facade-installation',
    type: 'Construction Video',
    title: 'Curtain wall installation sequence - Mullion positioning and glazing unit placement',
    summary: 'High-definition video showing precise installation of glass panels and mullion alignment across full building elevation.',
    author: 'Facade Installer',
    field: 'Engineering',
    interests: ['video', 'facade', 'glass'],
    stats: '1.9k views • 127 comments',
    media: [
      { url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', mediaType: 'video', fileName: 'curtain_wall_install.mp4' },
      { url: 'https://picsum.photos/800/600?random=142', mediaType: 'image', fileName: 'Glass_closeup.jpg' },
      { url: 'https://picsum.photos/800/600?random=143', mediaType: 'image', fileName: 'mullion_detail.jpg' },
    ],
    createdAt: '2026-04-12T11:45:00Z',
  },

  {
    id: 'post-video-safety-drill',
    type: 'Safety Video',
    title: 'Site-wide emergency evacuation drill - Full protocol execution',
    summary: 'Complete site evacuation drill conducted with all personnel. Shows assembly point accounting, medical response team activation, and all-clear procedures.',
    author: 'Safety Manager',
    field: 'Engineering',
    interests: ['video', 'safety', 'emergency'],
    stats: '1.2k views • 89 comments',
    media: [
      { url: 'https://www.w3schools.com/html/mov_bbb.mp4', mediaType: 'video', fileName: 'evacuation_drill.mp4' },
    ],
    createdAt: '2026-04-11T09:00:00Z',
  },

  {
    id: 'post-video-rebar-placement',
    type: 'Quality Video',
    title: 'Rebar cage installation and positioning - 3D visualization of load path',
    summary: 'Video documentation of structural rebar placement with overlay showing load distribution paths and critical connection details.',
    author: 'Structural Inspector',
    field: 'Engineering',
    interests: ['video', 'rebar', 'structural'],
    stats: '1.4k views • 105 comments',
    media: [
      { url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', mediaType: 'video', fileName: 'rebar_placement_detail.mp4' },
      { url: 'https://picsum.photos/800/600?random=144', mediaType: 'image', fileName: 'rebar_closeup.jpg' },
    ],
    createdAt: '2026-04-10T15:30:00Z',
  },

  {
    id: 'post-video-equipment-demo',
    type: 'Equipment Video',
    title: 'New concrete pump demonstrator - Capabilities and reach verification',
    summary: 'Manufacturer technical demonstration showing pump placement, boom reach, and delivery accuracy for various concrete mixes.',
    author: 'Equipment Manager',
    field: 'Engineering',
    interests: ['video', 'equipment', 'demo'],
    stats: '956 views • 72 comments',
    media: [
      { url: 'https://www.w3schools.com/html/mov_bbb.mp4', mediaType: 'video', fileName: 'concrete_pump_demo.mp4' },
    ],
    createdAt: '2026-04-09T12:20:00Z',
  },

  {
    id: 'post-video-testing',
    type: 'Testing Video',
    title: 'Accelerated testing of fire-rated doors - Thermal imaging and burn-through verification',
    summary: 'Complete test cycle showing door assembly, thermal loading, and temperature monitoring at various points during 2-hour fire rating test.',
    author: 'Test Engineer',
    field: 'Engineering',
    interests: ['video', 'testing', 'fire-rating'],
    stats: '1.6k views • 118 comments',
    media: [
      { url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', mediaType: 'video', fileName: 'fire_door_testing.mp4' },
      { url: 'https://picsum.photos/800/600?random=145', mediaType: 'image', fileName: 'thermal_imaging.jpg' },
    ],
    createdAt: '2026-04-08T10:15:00Z',
  },

  {
    id: 'post-video-commissioning-hvac',
    type: 'Commissioning Video',
    title: 'HVAC system startup sequence - Air handler, damper, and ductwork pressurization',
    summary: 'Full commissioning video showing startup procedure, flow balance verification, and return air path continuity testing.',
    author: 'HVAC Commissioning',
    field: 'Engineering',
    interests: ['video', 'hvac', 'commissioning'],
    stats: '834 views • 61 comments',
    media: [
      { url: 'https://www.w3schools.com/html/mov_bbb.mp4', mediaType: 'video', fileName: 'hvac_startup_sequence.mp4' },
    ],
    createdAt: '2026-04-07T16:45:00Z',
  },

  {
    id: 'post-video-architectural-tour',
    type: 'Project Video',
    title: 'Architectural walkthrough tour - 360° perspective of completed fit-out zones',
    summary: 'Comprehensive video tour of completed areas with architectural commentary on design intent and material selections.',
    author: 'Architect',
    field: 'Architecture',
    interests: ['video', 'architecture', 'tour'],
    stats: '2.4k views • 184 comments',
    media: [
      { url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', mediaType: 'video', fileName: 'architecture_walkthrough_tour.mp4' },
      { url: 'https://picsum.photos/800/600?random=146', mediaType: 'image', fileName: 'architecture_detail_1.jpg' },
      { url: 'https://picsum.photos/800/600?random=147', mediaType: 'image', fileName: 'architecture_detail_2.jpg' },
    ],
    createdAt: '2026-04-06T13:10:00Z',
  },

  {
    id: 'post-video-drone-survey',
    type: 'Drone Footage',
    title: 'Drone aerial survey - Weekly progress overview from multiple altitudes',
    summary: 'High-definition aerial photography and video from multiple elevation angles. Perfect for progress reports and stakeholder updates.',
    author: 'Drone Pilot',
    field: 'Engineering',
    interests: ['video', 'drone', 'survey'],
    stats: '3.1k views • 212 comments',
    media: [
      { url: 'https://www.w3schools.com/html/mov_bbb.mp4', mediaType: 'video', fileName: 'drone_aerial_survey.mp4' },
      { url: 'https://picsum.photos/800/600?random=148', mediaType: 'image', fileName: 'aerial_overview_wide.jpg' },
      { url: 'https://picsum.photos/800/600?random=149', mediaType: 'image', fileName: 'aerial_closeup.jpg' },
    ],
    createdAt: '2026-04-05T11:30:00Z',
  },

  {
    id: 'post-video-waterproofing',
    type: 'Technical Video',
    title: 'Waterproofing membrane application technique - Sealing penetrations and joint details',
    summary: 'Hands-on technical video showing proper membrane overlaps, sealing compound application, and detail edge finishing.',
    author: 'Waterproofing Specialist',
    field: 'Engineering',
    interests: ['video', 'waterproofing', 'technique'],
    stats: '1.3k views • 94 comments',
    media: [
      { url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', mediaType: 'video', fileName: 'waterproofing_application.mp4' },
      { url: 'https://picsum.photos/800/600?random=150', mediaType: 'image', fileName: 'waterproofing_detail.jpg' },
    ],
    createdAt: '2026-04-04T14:50:00Z',
  },

  {
    id: 'post-video-paint-application',
    type: 'Quality Control',
    title: 'Interior paint application standards - Color matching and finish verification',
    summary: 'QA video showing prep work, paint application technique, color matching under different lighting, and finish inspection checklist.',
    author: 'Paint QA Inspector',
    field: 'Engineering',
    interests: ['video', 'paint', 'quality'],
    stats: '689 views • 51 comments',
    media: [
      { url: 'https://www.w3schools.com/html/mov_bbb.mp4', mediaType: 'video', fileName: 'paint_application_qa.mp4' },
      { url: 'https://picsum.photos/800/600?random=151', mediaType: 'image', fileName: 'paint_color_match.jpg' },
    ],
    createdAt: '2026-04-03T09:25:00Z',
  },

  {
    id: 'post-video-site-logistics',
    type: 'Operational Video',
    title: 'Material delivery and site logistics optimization - Traffic flow and staging areas',
    summary: 'Video documentation of improved material flow, reduced wait times, and optimized site traffic routing for daily deliveries.',
    author: 'Logistics Coordinator',
    field: 'Project Management',
    interests: ['video', 'logistics', 'optimization'],
    stats: '745 views • 68 comments',
    media: [
      { url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', mediaType: 'video', fileName: 'site_logistics_optimization.mp4' },
    ],
    createdAt: '2026-04-02T15:40:00Z',
  },

  {
    id: 'post-video-training-module',
    type: 'Training Video',
    title: 'Site safety training module - Proper PPE donning and equipment inspection',
    summary: 'Complete training video suitable for new site personnel. Covers all mandatory safety equipment and inspection checklist.',
    author: 'Safety Training',
    field: 'Engineering',
    interests: ['video', 'training', 'safety'],
    stats: '1.7k views • 106 comments',
    media: [
      { url: 'https://www.w3schools.com/html/mov_bbb.mp4', mediaType: 'video', fileName: 'safety_training_ppe.mp4' },
    ],
    createdAt: '2026-04-01T10:05:00Z',
  },

  {
    id: 'post-video-meeting-highlights',
    type: 'Meeting Minutes',
    title: 'Weekly coordination meeting highlights - 4-minute summary of key decisions',
    summary: 'Quick highlight video from the weekly coordination meeting covering safety items, schedule updates, and action items.',
    author: 'Project Controls',
    field: 'Project Management',
    interests: ['video', 'meeting', 'coordination'],
    stats: '523 views • 43 comments',
    media: [
      { url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', mediaType: 'video', fileName: 'coordination_meeting_highlights.mp4' },
    ],
    createdAt: '2026-03-31T16:20:00Z',
  },

  {
    id: 'post-video-before-after',
    type: 'Progress Documentation',
    title: 'Before and after comparison - Structural demolition to new slab pour',
    summary: 'Side-by-side time-compressed video showing 3-day transformation from demolition cleanup to new structural slab ready for curing.',
    author: 'Documentation Team',
    field: 'Engineering',
    interests: ['video', 'progress', 'before-after'],
    stats: '1.9k views • 141 comments',
    media: [
      { url: 'https://www.w3schools.com/html/mov_bbb.mp4', mediaType: 'video', fileName: 'before_after_demolition.mp4' },
      { url: 'https://picsum.photos/800/600?random=152', mediaType: 'image', fileName: 'demo_phase_start.jpg' },
      { url: 'https://picsum.photos/800/600?random=153', mediaType: 'image', fileName: 'slab_complete_finish.jpg' },
    ],
    createdAt: '2026-03-30T12:35:00Z',
  },
];
