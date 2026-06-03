// Mock data for OLLCOLLAB

export const CATEGORIES = ["All", "Beauty", "Fashion", "Lifestyle", "Fitness", "Food", "Tech"];

export const OPPORTUNITIES = [
  {
    id: "op-1",
    brandId: "brand-1",
    brandName: "Glow Skincare",
    brandCategory: "Skincare",
    verified: true,
    cover: "https://images.unsplash.com/photo-1629380108599-ea06489d66f5?crop=entropy&cs=srgb&fm=jpg&w=940&q=85",
    title: "Vitamin C Serum Promotion",
    pitch: "We are a skincare brand looking for 10 potential creators to promote our new product.",
    payout: 500,
    deadline: "5 June 2025",
    creatorsNeeded: 10,
    category: "Beauty",
    description: "We're launching our Vitamin C Serum and looking for authentic creators who can show it in their daily skincare routine.",
    requirements: ["5K+ Followers", "18–35 Age Group", "Good Engagement Rate"],
    applicants: 24,
  },
  {
    id: "op-2",
    brandId: "brand-2",
    brandName: "Luxe Fashion",
    brandCategory: "Fashion",
    verified: true,
    cover: "https://images.unsplash.com/photo-1760126119562-4972951eb6bc?crop=entropy&cs=srgb&fm=jpg&w=940&q=85",
    title: "Summer Collection Showcase",
    pitch: "Looking for 5 fashion creators to showcase our summer collection.",
    payout: 750,
    deadline: "12 June 2025",
    creatorsNeeded: 5,
    category: "Fashion",
    description: "Highlight our breezy summer drops in a styled reel — beach, brunch or rooftop vibes welcome.",
    requirements: ["10K+ Followers", "Fashion-focused content", "Reels experience"],
    applicants: 41,
  },
  {
    id: "op-3",
    brandId: "brand-3",
    brandName: "Pure Nutrition",
    brandCategory: "Health & Nutrition",
    verified: false,
    cover: "https://images.unsplash.com/photo-1748543668676-ea8241cb3886?crop=entropy&cs=srgb&fm=jpg&w=940&q=85",
    title: "Daily Wellness Routine",
    pitch: "Show your daily wellness routine featuring our plant-based protein.",
    payout: 600,
    deadline: "20 June 2025",
    creatorsNeeded: 8,
    category: "Fitness",
    description: "We want authentic, no-filter morning routines featuring Pure Nutrition's plant protein in a creative way.",
    requirements: ["3K+ Followers", "Fitness/Wellness niche", "Story + Reel combo"],
    applicants: 18,
  },
  {
    id: "op-4",
    brandId: "brand-4",
    brandName: "FitLife India",
    brandCategory: "Fitness",
    verified: true,
    cover: "https://images.unsplash.com/photo-1760736534430-ed4a321e108f?crop=entropy&cs=srgb&fm=jpg&w=940&q=85",
    title: "Home Workout Challenge",
    pitch: "Join our 7-day home workout challenge as a featured creator.",
    payout: 900,
    deadline: "25 June 2025",
    creatorsNeeded: 12,
    category: "Fitness",
    description: "Document your 7-day journey using our gear. We're looking for authenticity over polish.",
    requirements: ["5K+ Followers", "Active fitness audience", "Min. 3 reels/week"],
    applicants: 32,
  },
];

export const BRANDS = [
  { id: "brand-1", name: "Glow Skincare", category: "Skincare", verified: true, logo: "GLOW" },
  { id: "brand-2", name: "Luxe Fashion", category: "Fashion", verified: true, logo: "LUXE" },
  { id: "brand-3", name: "Pure Nutrition", category: "Health & Nutrition", verified: false, logo: "PURE" },
  { id: "brand-4", name: "FitLife India", category: "Fitness", verified: true, logo: "FIT" },
  { id: "brand-5", name: "Mamaearth", category: "Beauty", verified: true, logo: "MAMA" },
  { id: "brand-6", name: "Plum Goodness", category: "Beauty", verified: true, logo: "PLUM" },
  { id: "brand-7", name: "boAt", category: "Tech", verified: true, logo: "BOAT" },
];

export const CREATOR_AVATARS = [
  "https://images.unsplash.com/photo-1527203561188-dae1bc1a417f?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
  "https://images.unsplash.com/photo-1601597565151-70c4020dc0e1?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
  "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
  "https://images.pexels.com/photos/31977358/pexels-photo-31977358.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400",
];

export const APPLICANTS = [
  { id: "c-1", name: "Riya Sharma", handle: "@riya.sharmaa", followers: "124K", engagement: "8.2%", avatar: CREATOR_AVATARS[0], status: "shortlisted" },
  { id: "c-2", name: "Ananya Gupta", handle: "@ananya.g", followers: "25.1K", engagement: "6.8%", avatar: CREATOR_AVATARS[1], status: "applied" },
  { id: "c-3", name: "Mehak Verma", handle: "@mehak.v", followers: "9.8K", engagement: "7.1%", avatar: CREATOR_AVATARS[2], status: "applied" },
  { id: "c-4", name: "Neha Iyer", handle: "@neha.iyer", followers: "15.3K", engagement: "5.9%", avatar: CREATOR_AVATARS[3], status: "accepted" },
  { id: "c-5", name: "Pooja Nair", handle: "@pooja.nair", followers: "48K", engagement: "9.0%", avatar: CREATOR_AVATARS[0], status: "shortlisted" },
];

export const MY_APPLICATIONS = [
  { id: "a-1", opportunityId: "op-1", brandName: "Glow Skincare", appliedOn: "28 May 2025", status: "applied" },
  { id: "a-2", opportunityId: "op-2", brandName: "Luxe Fashion", appliedOn: "27 May 2025", status: "viewed" },
  { id: "a-3", opportunityId: "op-3", brandName: "Pure Nutrition", appliedOn: "26 May 2025", status: "accepted" },
  { id: "a-4", opportunityId: "op-4", brandName: "FitLife India", appliedOn: "25 May 2025", status: "rejected" },
];

export const REELS = [
  {
    id: "reel-1",
    thumbnail: "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
    brand: "Mamaearth",
    title: "GRWM ft. Vit-C Serum",
    instagramUrl: "https://instagram.com/p/reel-1",
  },
  {
    id: "reel-2",
    thumbnail: "https://images.unsplash.com/photo-1601597565151-70c4020dc0e1?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
    brand: "Luxe Fashion",
    title: "Summer drops haul",
    instagramUrl: "https://instagram.com/p/reel-2",
  },
  {
    id: "reel-3",
    thumbnail: "https://images.unsplash.com/photo-1527203561188-dae1bc1a417f?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
    brand: "Plum Goodness",
    title: "Night routine that works",
    instagramUrl: "https://instagram.com/p/reel-3",
  },
  {
    id: "reel-4",
    thumbnail: "https://images.unsplash.com/photo-1629380108599-ea06489d66f5?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
    brand: "Glow Skincare",
    title: "Sunscreen first impression",
    instagramUrl: "https://instagram.com/p/reel-4",
  },
  {
    id: "reel-5",
    thumbnail: "https://images.pexels.com/photos/31977358/pexels-photo-31977358.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900",
    brand: "boAt",
    title: "Morning beats walkthrough",
    instagramUrl: "https://instagram.com/p/reel-5",
  },
  {
    id: "reel-6",
    thumbnail: "https://images.unsplash.com/photo-1748543668676-ea8241cb3886?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
    brand: "Pure Nutrition",
    title: "What I eat in a day",
    instagramUrl: "https://instagram.com/p/reel-6",
  },
];

export const PORTFOLIO = [
  "https://images.unsplash.com/photo-1527203561188-dae1bc1a417f?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
  "https://images.unsplash.com/photo-1601597565151-70c4020dc0e1?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
  "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
  "https://images.unsplash.com/photo-1629380108599-ea06489d66f5?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
];

export const MESSAGES_THREADS = [
  {
    id: "t-1",
    name: "Glow Skincare",
    avatar: "GLOW",
    online: true,
    lastMessage: "Sure, here's my handle @riya.sharmaa",
    time: "11:34 AM",
    unread: 0,
    messages: [
      { from: "brand", text: "Hi Riya! We loved your profile. Are you available for this campaign?", time: "11:30 AM" },
      { from: "me", text: "Hi! Thank you so much. Yes, I'm available.", time: "11:32 AM" },
      { from: "brand", text: "Great! Can we connect on Instagram to discuss further?", time: "11:33 AM" },
      { from: "me", text: "Sure, here's my handle @riya.sharmaa", time: "11:34 AM" },
    ],
  },
  {
    id: "t-2",
    name: "Luxe Fashion",
    avatar: "LUXE",
    online: false,
    lastMessage: "We'll get back to you by Friday.",
    time: "Yesterday",
    unread: 2,
    messages: [
      { from: "brand", text: "Your portfolio is stunning!", time: "Yesterday" },
      { from: "brand", text: "We'll get back to you by Friday.", time: "Yesterday" },
    ],
  },
  {
    id: "t-3",
    name: "Pure Nutrition",
    avatar: "PURE",
    online: false,
    lastMessage: "Welcome aboard 🎉",
    time: "2d ago",
    unread: 0,
    messages: [{ from: "brand", text: "Welcome aboard 🎉", time: "2d ago" }],
  },
];

export const NOTIFICATIONS = [
  { id: "n-1", type: "view", icon: "Eye", text: "Glow Skincare viewed your profile.", time: "10m", unread: true },
  { id: "n-2", type: "accept", icon: "Check", text: "Luxe Fashion accepted your application.", time: "1h", unread: true },
  { id: "n-3", type: "message", icon: "MessageCircle", text: "You have a new message from Glow Skincare.", time: "3h", unread: true },
  { id: "n-4", type: "post", icon: "Megaphone", text: "Pure Nutrition posted a new opportunity.", time: "1d", unread: false },
  { id: "n-5", type: "mention", icon: "AtSign", text: "@ananya.g mentioned you in a comment.", time: "2d", unread: false },
];

export const RECENT_SEARCHES = ["Skincare", "Fashion", "Reel Collab", "Beauty Brands"];

export const DEFAULT_USER = {
  creator: {
    name: "Riya Sharma",
    handle: "@riya.sharmaa",
    bio: "Lifestyle creator | Skincare & Fashion Lover",
    category: ["Lifestyle", "Fashion", "Beauty"],
    followers: "124K",
    engagement: "8.2%",
    collaborations: 42,
    avatar: CREATOR_AVATARS[0],
    socials: { instagram: "@riya.sharmaa", youtube: "riyasharmaa", tiktok: "riyaa" },
    instagramUrl: "https://instagram.com/riya.sharmaa",
  },
  brand: {
    name: "Glow Skincare",
    handle: "@glow.skincare",
    bio: "Clean, effective & safe skincare. Trusted by 1M+ customers.",
    category: ["Beauty", "Skincare"],
    logo: "GLOW",
    socials: { instagram: "@glowskincare", website: "glow.in" },
    stats: { activePosts: 3, totalApplicants: 24, profileViews: 120 },
  },
};

export const ACTIVE_POSTS = [
  { id: "p-1", title: "Vitamin C Serum Campaign", needed: 10, applicants: 24 },
  { id: "p-2", title: "Sunscreen Promotion", needed: 8, applicants: 18 },
  { id: "p-3", title: "New Facewash Launch", needed: 12, applicants: 32 },
];
