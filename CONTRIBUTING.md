# Contributing to OpenCleaner

Thanks for your interest in contributing!

## Requirements

- macOS 15 Sequoia or later (the app only runs on macOS)
- Node.js 18+
- Git

## Setup

```bash
git clone https://github.com/aitorevi/open-cleaner.git
cd open-cleaner
npm install
npm run dev
```

On first launch, grant Full Disk Access in System Preferences → Privacy & Security.

## Development

```bash
npm run dev          # run with hot reload
npm run typecheck    # type check (main + renderer)
npm run test         # run unit tests
npm run lint         # lint
npm run format       # format with Prettier
```

## Architecture

The project follows clean architecture with three layers:

```
domain/          ← entities + port interfaces (no dependencies)
application/     ← use cases (depend only on domain)
infrastructure/  ← adapters, IPC handlers (depend on application)
```

Use cases are tested with port mocks — no Electron or real filesystem needed in tests.

## How to contribute

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Make your changes and add tests if applicable
4. Run `npm run typecheck && npm run test` — both must pass
5. Open a Pull Request

## Commit style

Use short, imperative messages: `add drag-and-drop support`, `fix junk file detection on Ventura`.

## Reporting bugs

Open an issue with:
- macOS version
- Steps to reproduce
- Expected vs actual behavior
