export type DeliverablePreset = {
  label: string
  deliverableKey: string
  packSize?: number
}

export const DELIVERABLE_PRESETS: DeliverablePreset[] = [
  { label: "Instagram Feed Post", deliverableKey: "instagram-feed-post", packSize: 1 },
  { label: "Instagram Reel", deliverableKey: "instagram-reel", packSize: 1 },
  { label: "Instagram Story (single)", deliverableKey: "instagram-story-single", packSize: 1 },
  { label: "Instagram Stories (3-pack)", deliverableKey: "instagram-stories-3", packSize: 3 },
  { label: "TikTok Feed Post", deliverableKey: "tiktok-feed-post", packSize: 1 },
  { label: "TikTok Spark Ad", deliverableKey: "tiktok-spark-ad", packSize: 1 },
  { label: "YouTube Video", deliverableKey: "youtube-video", packSize: 1 },
  { label: "YouTube Short", deliverableKey: "youtube-short", packSize: 1 },
  { label: "Podcast Host Read", deliverableKey: "podcast-host-read", packSize: 1 },
  { label: "Newsletter Feature", deliverableKey: "newsletter-feature", packSize: 1 },
  { label: "Blog Post", deliverableKey: "blog-post", packSize: 1 },
]
