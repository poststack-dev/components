# @poststack/next

Next.js components for [Poststack](https://poststack.dev) - The modern image optimization and delivery service.

## Installation

```bash
npm install @poststack/next
# or
yarn add @poststack/next
# or
pnpm add @poststack/next
```

## Requirements

- Next.js 13 or later
- React 18 or later
- Tailwind CSS 3 or later

## Setup

1. Add your Poststack credentials to your `.env.local` file:

```env
NEXT_PUBLIC_POSTSTACK_PROJECT=your_project_id
NEXT_PUBLIC_POSTSTACK_PK=your_public_key
NEXT_PUBLIC_POSTSTACK_ENDPOINT=https://api-euw1.poststack.dev # Optional: defaults to EU West 1
```

2. Make sure your Tailwind CSS is configured in your project. The components use Tailwind classes for styling.

## Components

### PoststackImage

A responsive image component that automatically optimizes and delivers images based on the viewer's device and viewport.

```tsx
import { PoststackImage } from '@poststack/next'

export default function MyComponent() {
  return (
    <PoststackImage
      mediaId="your_media_id"
      className="rounded-lg" // Optional: Additional Tailwind classes
      proportions="16:9"    // Optional: Force aspect ratio
      responsive={true}     // Optional: Re-optimize on viewport changes
      maxWidth={600}        // Optional: Enforce maxWidth of image served, regardless of viewport / image display size
    />
  )
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mediaId` | `string` | Required | The ID of the media from your Poststack project |
| `projectId` | `string` | `process.env.NEXT_PUBLIC_POSTSTACK_PROJECT` | Your Poststack project ID |
| `publicKey` | `string` | `process.env.NEXT_PUBLIC_POSTSTACK_PK` | Your Poststack public key |
| `maxWidth` | `number` | Container width | Maximum width of the image |
| `proportions` | `"4:3" \| "1:1" \| "16:9" \| "9:16"` | - | Force a specific aspect ratio |
| `responsive` | `boolean` | `false` | Whether to re-fetch optimized image on viewport resize |
| `className` | `string` | - | Additional CSS classes |
| `debug` | `boolean` | `false` | Show debug information overlay |

## Advanced Usage

### Custom Endpoint

If you're using a different region or custom domain, you can set the endpoint:

```env
NEXT_PUBLIC_POSTSTACK_ENDPOINT=https://your-custom-domain.com
```

### Debug Mode

Enable debug mode to see information about the image delivery:

```tsx
<PoststackImage
  mediaId="your_media_id"
  debug={true}
/>
```

This will show an overlay with:
- Element width
- Viewport width
- Format support (WebP/AVIF)
- Project ID
- Media ID
- Responsive mode status

## Learn More

- [Poststack Documentation](https://poststack.dev/docs)
- [API Reference](https://poststack.dev/docs/api)
- [Dashboard](https://poststack.dev/dashboard)

## License

MIT 