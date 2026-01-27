# OpenCleaner - Quick Start Guide

## Prerequisites

- ✅ Node.js installed
- ✅ npm installed
- ✅ macOS (for Full Disk Access features)

## Installation

All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Running the Application

### Start Development Server

```bash
npm run dev
```

This will:

1. Compile TypeScript
2. Start Electron
3. Launch the application with hot-reload

### First Launch

When you first start the app:

1. **Without Full Disk Access**:
   - You'll see the Onboarding screen
   - Follow the instructions to grant Full Disk Access
   - Click "Check Again" after granting permission

2. **With Full Disk Access**:
   - You'll see the main application
   - Applications from `/Applications` will be listed
   - You can select and uninstall any application

## Granting Full Disk Access

### Method 1: System Settings (Recommended)

```
1. Open System Settings
2. Privacy & Security → Full Disk Access
3. Click the + button
4. Navigate to the app location:
   - For development: Find the Electron app in /Applications/
   - Or add Terminal.app if running from terminal
5. Enable the checkbox
6. Restart the application
```

### Method 2: Command Line

```bash
# For development, you may need to grant Terminal.app Full Disk Access
# Then run the app from Terminal:
npm run dev
```

## Testing the Application

### Check TypeScript Compilation

```bash
npm run typecheck
```

Expected: No errors

### Run Linter

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

## Application Features

### Main Screen (After Permissions)

- **Left Panel**: List of installed applications
  - Shows app name and size
  - Click to select

- **Right Panel**: Application details
  - Path, size, version
  - Uninstall button

- **Refresh Button**: Rescan applications

### Uninstalling an App

1. Select an application from the list
2. Click "Uninstall" button
3. Confirm the action
4. App is moved to Trash (not deleted permanently)
5. List refreshes automatically

## Building for Production

### Build macOS App

```bash
npm run build:mac
```

The built application will be in the `dist/` folder.

## Troubleshooting

### Issue: "Permission Denied" Errors

**Solution**: Grant Full Disk Access as described above

### Issue: Apps Not Appearing

**Possible Causes**:

- Full Disk Access not granted
- Scanning the wrong directory

**Solution**:

1. Check Full Disk Access
2. Try the "Refresh" button

### Issue: Can't Uninstall

**Possible Causes**:

- App is currently running
- Protected system application

**Solution**:

1. Quit the application first
2. System apps may require admin privileges

### Issue: Development Server Won't Start

**Solution**:

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Development Tips

### Hot Reload

The development server supports hot reload for:

- ✅ React components
- ✅ CSS changes
- ⚠️ Main process changes require restart

### DevTools

Press `F12` or `Cmd+Option+I` to open Chrome DevTools

### Checking IPC

In DevTools Console:

```javascript
// Check if API is exposed
console.log(window.api)

// Test permission check
window.api.checkPermissions().then(console.log)

// Test app scanning
window.api.scanApplications().then(console.log)
```

## Project Structure Quick Reference

```
src/
├── main/           # Electron main process
│   ├── adapters/   # Implementations
│   ├── ports/      # Interfaces
│   ├── usecases/   # Business logic
│   └── ipc/        # Communication
├── preload/        # Context bridge
├── renderer/       # React UI
│   └── src/
│       ├── components/
│       ├── hooks/
│       └── App.tsx
└── shared/         # Shared types
    └── domain/
```

## Common Commands

| Command             | Description              |
| ------------------- | ------------------------ |
| `npm run dev`       | Start development server |
| `npm run build`     | Build for production     |
| `npm run build:mac` | Build macOS app          |
| `npm run typecheck` | Check TypeScript         |
| `npm run lint`      | Run linter               |
| `npm run format`    | Format code              |

## Next Steps

1. ✅ Run `npm run dev` to start the application
2. ✅ Grant Full Disk Access if needed
3. ✅ Test application scanning
4. ✅ Test uninstall functionality
5. 📝 Review code in `src/` directories
6. 🔧 Make modifications as needed
7. 📦 Build for production when ready

## Support

For issues or questions:

- Check `README_OPENCLEANER.md` for detailed documentation
- Review `IMPLEMENTATION_SUMMARY.md` for architecture details
- Check TypeScript errors with `npm run typecheck`

## Safety Notes

⚠️ **Important**:

- Applications are moved to Trash, not permanently deleted
- You can restore from Trash if needed
- System applications may have protection
- Always test uninstall with non-critical apps first

🔒 **Security**:

- Full Disk Access is required for scanning protected directories
- IPC is secured with Context Bridge
- No direct Node.js access from renderer

---

**Ready to Start**: Just run `npm run dev` and you're good to go!
