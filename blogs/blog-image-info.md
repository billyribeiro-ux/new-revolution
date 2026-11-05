Your blog feature card images should share the exact same 16:9 aspect ratio as your article hero image so you only have to generate one master image per blog post (1200 × 675 px or 1600 × 900 px WebP) and let responsive sizes / srcset serve the exact lightweight derivative for the grid cards.A breakdown of the exact dimensions for every placement across the blog system is detailed below:1. The Master Single-Asset Standard (Recommended)If you want one universal image file per post that works across the Blog Index Feature Card, Article Hero, Google Discover, and Social/OpenGraph without cropping issues:Master Source Dimensions: 1200 × 675 px (or 1600 × 900 px for Retina/4K Hero)Aspect Ratio: 16:9Format: .webp (or .avif)2. Exact Rendered Dimensions by Card Type (2x Retina Ready)If you are generating dedicated derivatives (or configuring @sveltejs/enhanced-img / srcset widths) for your /blog index page:Placement on /blogRendered CSS Box (Desktop)Exact Image Dimension to Export (2x Retina)Aspect RatioTarget File WeightTop "Featured Post" Bento Card (2-column wide hero card on /blog)~600 × 338 px to 800 × 450 px1200 × 675 px16:9< 65 KBStandard 3-Column Blog Grid Card (Regular post cards on /blog)~380 × 214 px to 400 × 225 px800 × 450 px16:9< 35 KBArticle Page Top Hero (Inside /blog/[slug])~900 × 506 px to 1200 × 675 px1600 × 900 px (or 1200 × 675 px)16:9< 90 KBOpenGraph / X / Discord Card (Optional only if you want zero 1.91:1 crop)Social Feed Preview1200 × 630 px1.91:1< 80 KB3. Why 1200 × 675 px (16:9) Is the Sweet SpotGoogle Discover & AI Overview Mandate: Google requires article images to be at least 1200px wide (paired with max-image-preview:large) to appear as large cards in Google Discover and AI Overviews. An 800 × 450 px image alone is disqualified from Google Discover if used as the primary schema image.Zero Double-Work: If you generate your blog images at 1200 × 675 px (or 1600 × 900 px), the exact same image fits a aspect-video (16:9) Tailwind card container on the /blog grid and the /blog/[slug] hero with zero top/bottom clipping.Safe Zone for OpenGraph (1200 × 630): When X, LinkedIn, or Discord pulls a 1200 × 675 image into a 1200 × 630 social card, it only trims 22.5 pixels off the top and bottom edge—so as long as you keep text/badges inside the center 85% safe zone, you don't even need a separate 1200 × 630 file.4. Drop-In Svelte 5 Blog Feature Card Snippet (Zero CLS)To make sure your /blog index page hits a 100 PageSpeed score and 0.00 CLS, lock the container with aspect-video (16:9) and pass the explicit width and height attributes:Svelte<script lang="ts">
  interface Props {
    title: string;
    slug: string;
    excerpt: string;
    imageSrc: string;
    imageAlt: string;
    imageTitle?: string;
    category: string;
    readTime: string;
    isFeatured?: boolean;
  }

  let {
    title,
    slug,
    excerpt,
    imageSrc,
    imageAlt,
    imageTitle = title,
    category,
    readTime,
    isFeatured = false
  }: Props = $props();
</script>

<article class="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.15_0.02_260)] transition-all duration-300 hover:border-emerald-500/40">
  <a href="/blog/{slug}" class="relative block aspect-video w-full overflow-hidden bg-black/40">
    <img
      src={imageSrc}
      alt={imageAlt}
      title={imageTitle}
      width={isFeatured ? "1200" : "800"}
      height={isFeatured ? "675" : "450"}
      loading={isFeatured ? "eager" : "lazy"}
      fetchpriority={isFeatured ? "high" : "auto"}
      decoding="async"
      sizes={isFeatured
        ? "(max-width: 768px) 100vw, (max-width: 1280px) 66vw, 800px"
        : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"}
      class="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
    />
  </a>
</article>
Rule of thumb: Generate every blog header/card image at 1200 × 675 px (16:9 WebP) (or 1600 × 900 px if you want extra crispness on 5K/Retina displays), and use 800 × 450 px only if you are manually saving a separate thumbnail file for the smaller 3-column grid cards.