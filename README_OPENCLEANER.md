# OpenCleaner

A macOS application for cleanly uninstalling applications and their associated files, built with Electron, TypeScript, React, and Hexagonal Architecture.

## Features

- **Permission Management**: Automatically detects Full Disk Access permissions
- **App Scanning**: Scans system and user Applications folders
- **Clean Uninstall**: Moves applications to trash safely
- **Modern UI**: Beautiful, intuitive interface
- **Hexagonal Architecture**: Clean, maintainable codebase

## Prerequisites

- Node.js (v16 or later)
- npm
- macOS (required for Full Disk Access features)

## Installation

```bash
# Install dependencies
npm install
```

## Development

```bash
# Start development server
npm run dev
```

The application will launch in development mode with hot-reload enabled.

## Building

```bash
# Build for production
npm run build

# Build for macOS
npm run build:mac
```

## Project Structure

```
open-cleaner/
├── src/
│   ├── main/                      # Main process (Electron)
│   │   ├── adapters/              # Concrete implementations
│   │   │   ├── NodeFileSystemAdapter.ts
│   │   │   └── MacOSAppScannerAdapter.ts
│   │   ├── ports/                 # Domain interfaces
│   │   │   ├── IFileSystemPort.ts
│   │   │   └── IAppScannerPort.ts
│   │   ├── usecases/              # Business logic
│   │   │   ├── CheckPermissions.usecase.ts
│   │   │   ├── ScanApplications.usecase.ts
│   │   │   ├── FindJunkFiles.usecase.ts
│   │   │   └── MoveToTrash.usecase.ts
│   │   ├── ipc/                   # IPC handlers
│   │   │   └── handlers.ts
│   │   └── index.ts               # Main entry point
│   ├── preload/                   # Preload scripts
│   │   ├── index.ts               # Context Bridge
│   │   └── index.d.ts             # Type definitions
│   ├── renderer/                  # Renderer process (React)
│   │   └── src/
│   │       ├── components/
│   │       │   ├── Onboarding.tsx
│   │       │   ├── AppList.tsx
│   │       │   └── *.css
│   │       ├── hooks/
│   │       │   └── usePermissions.ts
│   │       ├── App.tsx
│   │       └── main.tsx
│   └── shared/                    # Shared code
│       └── domain/
│           └── App.entity.ts      # Domain entities
```

## Architecture

OpenCleaner follows Hexagonal Architecture (Ports and Adapters):

- **Domain Layer** (`shared/domain/`): Core entities and types
- **Ports** (`main/ports/`): Interface definitions
- **Adapters** (`main/adapters/`): Concrete implementations
- **Use Cases** (`main/usecases/`): Business logic
- **IPC** (`main/ipc/`): Communication bridge
- **UI** (`renderer/`): React components

## Granting Full Disk Access

For OpenCleaner to function properly, it needs Full Disk Access:

1. Open **System Settings** → **Privacy & Security** → **Full Disk Access**
2. Click the **+** button
3. Navigate to and select **OpenCleaner.app**
4. Ensure the checkbox next to OpenCleaner is enabled
5. Restart the application

## How It Works

### Permission Check Flow

1. App starts → `usePermissions()` hook executes
2. Renderer calls `window.api.checkPermissions()`
3. IPC sends request to main process
4. `CheckPermissionsUseCase` executes
5. `NodeFileSystemAdapter.checkAccess()` tries to read `~/Library/Safari`
6. Result returns to renderer
7. Shows Onboarding if no permissions, AppList if has permissions

### Application Scanning

The app scans:

- `/Applications` (system apps)
- `~/Applications` (user apps)

For each `.app` bundle:

- Reads application metadata
- Calculates total size
- Displays in the list

### Uninstallation

Uses Electron's `shell.trashItem()` to safely move apps to trash without permanent deletion.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:mac` - Build macOS app
- `npm run build:win` - Build Windows app (if configured)
- `npm run build:linux` - Build Linux app (if configured)

## Security Considerations

### Context Isolation

- Uses `contextBridge` for secure IPC
- Never exposes full Node.js modules to renderer
- All inputs validated before use

### Full Disk Access

- Required for accessing protected directories
- App should be signed for proper permission requests
- In development: manually add to Full Disk Access

### Path Validation

- All paths sanitized before operations
- Prevents path traversal attacks
- Confirms destructive operations

## Future Enhancements

- [ ] Junk file detection and removal
- [ ] Drag & drop support
- [ ] Batch uninstallation
- [ ] Space calculation preview
- [ ] Search and filter
- [ ] Application groups
- [ ] Export/import lists
- [ ] Unit and integration tests

## Technologies

- **Electron**: Desktop app framework
- **electron-vite**: Optimized build tool
- **React**: UI framework
- **TypeScript**: Type-safe development
- **fs-extra**: Enhanced file operations

## License

MIT

## Support

For issues, questions, or contributions, please open an issue on the project repository.
