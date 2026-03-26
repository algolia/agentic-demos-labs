# Spencer & Williams

A multi-vertical demo platform built with Next.js 16 and Algolia. Each vertical (ecommerce, fashion, etc.) is a fully self-contained demo with its own configuration, theme, and search experience.

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page, which auto-discovers all available verticals.

## Documentation

- [Getting Started](./docs/getting-started.md) — setup, configuration, and project structure
- [Agent Setup](./docs/agent-setup.md) — how to create the AI agents in Algolia Agent Studio
- [Architecture](./docs/architecture.md) — how the AI search bar button, chat panel, and tool execution work end-to-end
- [Guardrails](./docs/guardrails.md) — add content safety classification before messages reach your agent
