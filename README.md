# trendradar

[![Discord Chat](https://img.shields.io/discord/684898665143206084?logo=discord&style=social)](https://discord.gg/trendradar)

**trendradar** - Detecting the pulse of music trends. Empower developers and
music platforms with real-time trend intelligence, enabling data-driven
decisions that shape the future of music discovery.

## 📚 Documentation

- **[Branding Guide](docs/BRANDING_GUIDE.md)** - Complete brand guidelines for
  consistent UI
- **[Branding Checklist](docs/BRANDING_CHECKLIST.md)** - Implementation
  checklist and verification
- **API Documentation** - See below for endpoints

## Features

- 🎵 Real-time music analytics and trend detection
- 🔍 Advanced music search across songs, albums, and artists
- 🤖 AI-powered music analysis and recommendations
- 📊 Developer-friendly REST API
- 🔐 Secure OAuth authentication
- 💳 Stripe integration for premium features
- 🎨 Beautiful, responsive UI with official brand design
- ⚡ High performance with Deno and Fresh
- 📝 Blog with RSS feed

## Tech Stack

- **[Deno](https://deno.land/)** - Modern runtime for JavaScript and TypeScript
- **[Fresh](https://fresh.deno.dev/)** - Next-gen web framework
- **[Deno KV](https://deno.com/kv)** - Built-in data persistence
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Preact](https://preactjs.com/)** - Fast 3kB alternative to React
- **[Stripe](https://stripe.com/)** - Payment processing (optional)

## Brand System

### Official Brand Colors

- **Electric Purple** `#8B5CF6` - Primary brand color
- **Neon Cyan** `#06B6D4` - Secondary accent
- **Accent Pink** `#EC4899` - Highlights and gradients
- **Dark Background** `#0F172A` - Primary background
- **Soft White** `#F8FAFC` - Primary text

### Typography

- **Headings**: Orbitron (geometric sans-serif)
- **Body**: Plus Jakarta Sans
- **UI Elements**: DM Sans
- **Code**: JetBrains Mono

### Official Slogans

1. **Primary**: "Detecting the pulse of music trends"
2. **Technical**: "Real-time music trend intelligence"
3. **Product**: "Data-driven music discovery"
4. **Visionary**: "The future of music analytics"
5. **Community**: "By developers, for developers"

See [Branding Guide](docs/BRANDING_GUIDE.md) for complete implementation
details.

## Quick Start

### Prerequisites

- [Deno CLI](https://deno.com/manual/getting_started/installation) v1.40+
- [Git](https://github.com/git-guides/install-git)
- GitHub account (for OAuth)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/trendradar/musicapi.git
   cd musicapi
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Set up GitHub OAuth:
   - Go to [GitHub OAuth Apps](https://github.com/settings/applications/new)
   - Application name: `trendradar`
   - Homepage URL: `http://localhost:8000`
   - Authorization callback URL: `http://localhost:8000/callback`
   - Copy Client ID and Secret to `.env`

4. Start the server:
   ```bash
   deno task start
   ```

5. Open [http://localhost:8000](http://localhost:8000)

### Optional: Stripe Setup

1. Get your [Stripe API keys](https://dashboard.stripe.com/test/apikeys)
2. Add to `.env`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. Run initialization:
   ```bash
   deno task init:stripe
   ```

## Project Structure

```
.
├── components/          # Reusable UI components (branded)
├── islands/             # Interactive client components
├── routes/              # File-based routing (all pages branded)
│   ├── api/            # API endpoints
│   ├── blog/           # Blog pages
│   ├── account/        # User account pages
│   ├── dashboard/      # Admin dashboard
│   └── users/          # User profiles
├── plugins/             # Fresh plugins
├── utils/               # Utility functions
│   ├── constants.ts    # Brand constants
│   └── brand.ts        # Brand system utilities
├── static/              # Static assets
│   ├── styles.css      # Brand CSS system
│   ├── BRANDING.HTML   # Visual brand guide
│   └── BRANDING#2.html # Official brand assets
├── posts/               # Blog posts (markdown)
├── docs/                # Documentation
│   ├── BRANDING_GUIDE.md
│   └── BRANDING_CHECKLIST.md
├── tailwind.config.ts   # Theme configuration
└── BRANDING.json        # Complete brand system JSON
```

## Brand Implementation

All pages follow the official trendradar brand guidelines:

- ✅ Consistent logo usage (horizontal layout)
- ✅ Context-appropriate slogans
- ✅ Brand color scheme applied everywhere
- ✅ Typography hierarchy maintained
- ✅ Spacing and layout standards
- ✅ Responsive design at all breakpoints

## API Documentation

### Music API Endpoints

#### Search

```
GET /api/music/search?q={query}&filter={songs|albums|artists}
```

#### Track Info

```
GET /api/music/tracks/{videoId}
```

#### Top Charts

```
GET /api/music/top/tracks?limit=50
GET /api/music/top/artists?limit=50
```

#### AI Features

```
GET /api/music/ai/search?q={query}
POST /api/music/ai/recommendations
GET /api/music/ai/analysis/{videoId}
```

## Database

Uses Deno KV for data persistence. Available commands:

```bash
deno task db:seed      # Seed with sample data
deno task db:dump      # Export database
deno task db:restore   # Import database
deno task db:reset     # Clear database
```

## Deployment

### Deno Deploy

1. Push to GitHub
2. Connect to [Deno Deploy](https://dash.deno.com)
3. Set environment variables
4. Deploy!

### Docker

```bash
# Build
docker build -t trendradar .

# Run
docker run -p 8000:8000 --env-file .env trendradar
```

## Development Commands

```bash
deno task start        # Start dev server
deno task test         # Run tests
deno task ok          # Check fmt, lint, types, tests
deno task build       # Build for production
deno task preview     # Preview production build
```

## Environment Variables

| Variable                | Description           | Required |
| ----------------------- | --------------------- | -------- |
| `GITHUB_CLIENT_ID`      | GitHub OAuth app ID   | Yes      |
| `GITHUB_CLIENT_SECRET`  | GitHub OAuth secret   | Yes      |
| `STRIPE_SECRET_KEY`     | Stripe secret key     | No       |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | No       |
| `GA4_MEASUREMENT_ID`    | Google Analytics ID   | No       |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [Branding Guide](docs/BRANDING_GUIDE.md) for UI/UX guidelines when
contributing.

## License

MIT License - see [LICENSE](LICENSE) file

## Support

- 📧 Email: support@trendradar.io
- 💬 Discord: [Join our server](https://discord.gg/trendradar)
- 🐛 Issues: [GitHub Issues](https://github.com/trendradar/musicapi/issues)

---

**Built with ❤️ by the trendradar team**

_Official Brand System v1.0.0 - Detecting the pulse of music trends_
