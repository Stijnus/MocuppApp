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

## Critical Development Rules

### React Hooks Compliance
- **NEVER** place early returns before hook declarations - this violates Rules of Hooks
- All `useState`, `useEffect`, `useCallback`, `useMemo` must be declared before any conditional logic
- When adding validation checks, place them AFTER all hooks are declared
- Always run `npm run lint` after hook-related changes to catch violations

### Error Handling Patterns
- All components use ErrorBoundary wrappers for crash protection
- Image processing operations must have try-catch blocks with user-friendly error messages
- Canvas operations require null checks for context and image references
- Device frame loading failures should gracefully fallback to CSS-based frames

## Architecture Overview

Mocupp is a React + TypeScript application for creating high-quality mobile app mockups. Users upload app screenshots and render them within device frames with various viewing angles and perspectives.

### Core Architecture

- **State Management**: Uses `useReducer` with centralized state in `App.tsx`
- **Device System**: Device specifications defined in `src/data/DeviceSpecs.ts` with TypeScript interfaces in `src/types/DeviceTypes.ts`
- **Image Processing**: Fabric.js canvas-based image editor with enhanced optimization in `EnhancedFabricImageEditor.tsx`
- **3D Rendering**: Custom CSS transforms for device perspective views via `src/lib/viewUtils.ts`
- **Persistence**: Local storage management through `src/lib/storage.ts` with project/state saving
- **Quality Assurance**: Comprehensive device audit system via `src/lib/deviceAudit.ts`
- **Image Optimization**: Intelligent image analysis and optimization through `src/lib/imageOptimization.ts`
- **Device Positioning**: Advanced positioning and compatibility management via `src/lib/devicePositioning.ts`

### Key Data Flow

1. **Device Selection**: User selects device → triggers reducer action → device audit validation → updates device specs and view
2. **Image Upload**: File upload → base64 conversion → image analysis and optimization → stored in state → rendered in Fabric.js canvas
3. **View Manipulation**: User adjusts angles/perspective → calculates CSS transforms → applies to device container
4. **Quality Assurance**: Real-time device audit checks → compatibility validation → performance optimization hints
5. **State Persistence**: Device config and image states automatically saved to localStorage

### Important Files

- `src/App.tsx`: Main application with reducer-based state management
- `src/components/DeviceRenderer.tsx`: Core component that renders device frames with uploaded images
- `src/components/EnhancedFabricImageEditor.tsx`: Advanced image editor with optimization integration
- `src/components/DeviceAuditPanel.tsx`: Real-time device validation and quality metrics
- `src/components/ImageOptimizationPanel.tsx`: Image analysis and performance optimization UI
- `src/components/EnhancedProjectManager.tsx`: Advanced project management with filtering and batch operations
- `src/data/DeviceSpecs.ts`: Complete device specifications (iPhone 15/16 series)
- `src/lib/viewUtils.ts`: 3D view calculations and CSS transform generation
- `src/lib/storage.ts`: Complete localStorage management system with project support
- `src/lib/deviceAudit.ts`: Device validation, quality assurance, and compatibility checking
- `src/lib/imageOptimization.ts`: Image analysis, optimization strategies, and performance monitoring
- `src/lib/devicePositioning.ts`: Advanced device positioning and compatibility management

### Device Frame System

Device frames are PNG images stored in `/public/apple/` organized by model and orientation. The `layoutImage` function in device specs generates paths dynamically based on device model and orientation.

### View System

- **ViewAngle**: `'front' | 'angle-15' | 'angle-30'` etc. (supports negative angles)
- **PerspectiveView**: `'isometric' | 'perspective' | 'flat'`
- **Transform Generation**: `getViewConfig()` and `getTransformStyle()` in `viewUtils.ts`

### Quality Assurance System

- **Device Audit Engine**: Validates device specifications, identifies compatibility issues, and provides quality scores
- **Image Analysis Pipeline**: Analyzes uploaded images for optimal device frame fitting and performance
- **Compatibility Validation**: Real-time checking of image-device combinations with scoring and recommendations
- **Performance Monitoring**: Tracks rendering performance and provides optimization hints

### Enhanced Component Architecture

- **Enhanced Components**: Advanced versions of core components with integrated optimization and validation
- **Panel System**: Specialized panels for device auditing, image optimization, and project management
- **Strategy Pattern**: Multiple image placement strategies (contain, cover, fill, smart) with automatic selection
- **Real-time Feedback**: Live validation and optimization suggestions throughout the user workflow

## Performance Considerations

### Canvas Optimization
- High-DPI support with `devicePixelRatio` scaling in EnhancedFabricImageEditor
- Image smoothing enabled with 'high' quality setting for crisp rendering
- Proper memory management with canvas cleanup and context restoration

### Hook Dependencies
- Use `JSON.stringify` for deep comparison of complex state objects in useEffect
- Wrap callback functions in `useCallback` to prevent unnecessary re-renders
- Apply `useMemo` for expensive calculations and filtered data arrays
- Avoid recreating objects/arrays in render cycles - move constants outside components

### Device Frame Loading
- Device frames use PNG images from `/public/apple/` with 'Portrait'/'Landscape' naming convention
- Fallback to CSS gradients when frame images fail to load
- Scale factor of 3x (not 4.2x) for optimal device proportions

### Image Placeholder System
- Placeholders scale dynamically with device screen dimensions using percentage-based calculations
- Professional app icon placeholder with gradient background and realistic grid layout
- Device-specific information display (resolution, device name) with proper formatting
- All text and elements scale proportionally: icon (25% of screen), text (5.5% main, 4% info, 3.5% device name)
- Proper spacing and visual hierarchy that adapts to all device sizes

### Screen Shape and Corner Radius
- Screen corner radius calculated as 8% of the smaller screen dimension for realistic iPhone proportions
- Original device spec corner radius values (50-55px) are too large when scaled - use proportional calculation instead
- Frame corner radius = screen corner radius + 8px for proper device frame appearance
- This ensures the black screen area matches the actual iPhone screen shape, not an oval

### Image Clipping and Optimization
- Canvas uses proper clipping paths to ensure uploaded images conform to rounded rectangle shape
- EnhancedFabricImageEditor receives screenCornerRadius prop to apply correct clipping
- generateDeviceFrameSpecs updated to use proportional corner radius calculation (not device spec values)
- Canvas clipping supports both modern `roundRect` and fallback manual path creation for browser compatibility
- Image optimization system aligned with actual device screen proportions and scaling

## Common Issues and Solutions

### Temporal Dead Zone Errors
- Always define async functions before useEffect that calls them
- Use `useCallback` for async functions referenced in dependency arrays

### Infinite Re-render Loops
- Check for object recreation in useEffect dependencies
- Use refs to store previous values for comparison
- Wrap callbacks in `setTimeout(fn, 0)` to break render cycles if needed

### Component Crash Prevention
- Validate all required props at component start (after hooks)
- Use ErrorBoundary components around complex rendering logic
- Null-check canvas context and image references before operations

## Tech Stack Details

- **Vite**: Build tool with React plugin
- **Fabric.js**: Canvas-based image editing (crop, scale, rotate, filters)
- **Tailwind CSS**: Utility-first styling with custom animations
- **Radix UI**: Accessible component primitives (Select, Slider)
- **TypeScript**: Strict typing throughout with comprehensive interfaces
- **HTML-to-Image**: High-quality image export capabilities