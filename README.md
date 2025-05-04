# Sticky Notes Desktop App

A minimal, elegant desktop sticky notes application built with Electron. The app stays on top of other windows and provides a clean interface for managing tasks across multiple workspaces.

## Features

- 🎨 **Sleek Design**
  - Clean, minimal interface
  - Adapts to system theme (light/dark mode)
  - Transparent background when not focused
  - Fixed size for consistent experience

- 📝 **Task Management**
  - Add, edit, and delete tasks
  - Mark tasks as complete
  - Drag and drop task reordering
  - Persistent task input at the bottom

- 🗂️ **Workspace Organization**
  - Three fixed workspaces
  - Quick switching between workspaces
  - Numeric workspace names
  - Independent task lists per workspace

- 🖥️ **Desktop Integration**
  - Always-on-top window
  - Native window controls
  - System tray integration
  - Drag-to-move window

## Installation

### For Users
Download the latest release for your operating system from the [releases page](https://github.com/yourusername/sticky-notes/releases).

### For Developers
1. Clone the repository:
```bash
git clone https://github.com/yourusername/sticky-notes.git
cd sticky-notes
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

## Packaging and Distribution

### Prerequisites
- Node.js and npm installed
- For Windows builds: Windows 10/11
- For macOS builds: macOS 10.15 or later
- For Linux builds: Any modern Linux distribution

### Building the Application

1. Install dependencies:
```bash
npm install
```

2. Build for your current platform:
```bash
npm run dist
```

3. Build for specific platforms:
```bash
# Windows
npm run dist -- --win

# macOS
npm run dist -- --mac

# Linux
npm run dist -- --linux
```

The built applications will be available in the `dist` directory.

### Build Outputs
- Windows: `.exe` installer and portable version
- macOS: `.dmg` and `.zip` files
- Linux: `.AppImage` and `.deb` packages

## Usage

### Adding Tasks
- Type your task in the input field at the bottom
- Press Enter or click the plus button to add
- Tasks are automatically saved

### Managing Tasks
- Double-click a task to edit its content
- Click the checkmark to mark as complete
- Click the trash icon to delete
- Drag and drop to reorder tasks

### Switching Workspaces
- Use the left/right arrows to switch between workspaces
- The app maintains three fixed workspaces (1, 2, 3)
- Each workspace has its own independent task list

### Window Management
- Click and drag the window to move it
- Use the minimize and close buttons in the top-right
- The window stays on top of other applications

## Development

### Project Structure
```
sticky-notes/
├── index.html          # Main application window
├── styles.css          # Application styles
├── renderer.js         # Frontend logic
├── main.js            # Main process
├── package.json       # Project configuration
└── README.md          # Project documentation
```

### Technologies Used
- Electron
- HTML/CSS/JavaScript
- electron-store (for data persistence)
- electron-builder (for packaging)

### Development Commands
```bash
# Start the app in development mode
npm start

# Build the app for distribution
npm run dist

# Build without packaging (for testing)
npm run pack
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Font Awesome for icons
- Electron team for the framework
- All contributors and users 