# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev          # Starts Vite dev server on http://localhost:5173

# Build and quality checks
npm run build        # Production build using Vite
npm run lint         # ESLint with TypeScript support
npm run preview      # Preview production build locally
```

## Architecture Overview

Mocupp is a React + TypeScript application for creating high-quality mobile app mockups. Users upload app screenshots and render them within device frames with various viewing angles and perspectives.

### Core Architecture

- **State Management**: Uses `useReducer` with centralized state in `App.tsx`
- **Device System**: Device specifications defined in `src/data/DeviceSpecs.ts` with TypeScript interfaces in `src/types/DeviceTypes.ts`
- **Image Processing**: Fabric.js canvas-based image editor in `FabricImageEditor.tsx`
- **3D Rendering**: Custom CSS transforms for device perspective views via `src/lib/viewUtils.ts`
- **Persistence**: Local storage management through `src/lib/storage.ts` with project/state saving

### Key Data Flow

1. **Device Selection**: User selects device → triggers reducer action → updates device specs and view
2. **Image Upload**: File upload → base64 conversion → stored in state → rendered in Fabric.js canvas
3. **View Manipulation**: User adjusts angles/perspective → calculates CSS transforms → applies to device container
4. **State Persistence**: Device config and image states automatically saved to localStorage

### Important Files

- `src/App.tsx`: Main application with reducer-based state management
- `src/components/DeviceRenderer.tsx`: Core component that renders device frames with uploaded images
- `src/data/DeviceSpecs.ts`: Complete device specifications (iPhone 15/16 series)
- `src/lib/viewUtils.ts`: 3D view calculations and CSS transform generation
- `src/lib/storage.ts`: Complete localStorage management system with project support

### Device Frame System

Device frames are PNG images stored in `/public/apple/` organized by model and orientation. The `layoutImage` function in device specs generates paths dynamically based on device model and orientation.

### View System

- **ViewAngle**: `'front' | 'angle-15' | 'angle-30'` etc. (supports negative angles)
- **PerspectiveView**: `'isometric' | 'perspective' | 'flat'`
- **Transform Generation**: `getViewConfig()` and `getTransformStyle()` in `viewUtils.ts`

## Tech Stack Details

- **Vite**: Build tool with React plugin
- **Fabric.js**: Canvas-based image editing (crop, scale, rotate, filters)
- **Tailwind CSS**: Utility-first styling with custom animations
- **Radix UI**: Accessible component primitives (Select, Slider)
- **TypeScript**: Strict typing throughout with comprehensive interfaces