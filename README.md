# Vmark (微印)

Professional client-side image watermarking tool. Secure, fast, and easy to use.

## Features

- **Client-Side Processing**: All processing happens in your browser. Your images are never uploaded to a server, ensuring maximum privacy and security.
- **Real-Time Preview**: See changes instantly as you adjust watermark settings.
- **Customizable Text Watermarks**:
  - Adjust font size, color, and opacity.
  - Rotate text to any angle.
  - Set custom spacing and margins.
- **Pattern Support**: Choose between single watermark or repeating pattern (tiled) layout.
- **Multi-line Support**: Add multiple lines of text to your watermark.
- **High-Quality Export**: Export your watermarked images in PNG or JPG formats.
- **Internationalization**: Fully localized interface (English/Chinese).
- **Dark/Light Mode**: seamless UI adaptation.

## Tech Stack

- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: CSS / TailwindCSS
- **I18n**: [i18next](https://www.i18next.com/)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Algovate/vmark.git
   cd vmark
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm run dev
```

### Build

Build for production:

```bash
npm run build
```

## Deployment

This project is configured for deployment to GitHub Pages.

To deploy the latest version:

```bash
npm run deploy
```

The live site will be available at: `https://Algovate.github.io/vmark/`

## License

MIT
