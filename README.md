# use-pan-and-zoom

👆+🔎 React hook for panning and zooming a container.

Supports touch devices since version 0.4.0.

## Quick Start

```jsx
import usePanZoom from "use-pan-and-zoom";

const Demo = () => {
  const { transform, panZoomHandlers } = usePanZoom({
    setContainer
  });

  return (
    <div ref={el => setContainer(el)} {...panZoomHandlers}>
      <div style={{ transform }}>
        <p>Drag to 👆and scroll / pinch to 🔎 me!</p>
      </div>
    </div>
  );
};
```

[![Edit use-pan-and-zoom example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/n3rpmj60w0)

## Installation

`yarn add use-pan-and-zoom`

## Requirements

This package is a [React Hook](https://reactjs.org/docs/hooks-intro.html) and therefor requires React 16.8 or newer.

## Usage

usePanZoom takes the following parameters:

```tsx
{
  transform: String,
  pan: Position,
  zoom: Number,
  setPan: (position: Position | (position: Position) => Position) => void,
  setZoom: (zoom: Number | (zoom: Number) => Number, center: Position) => void,
  panZoomHandlers: {
    onTouchStart: (event: React.SyntheticEvent) => void,
    onTouchMove: (event: React.SyntheticEvent) => void,
    onTouchEnd: (event: React.SyntheticEvent) => void,
    onTouchCancel: (event: React.SyntheticEvent) => void,
    onMouseDown: (event: React.SyntheticEvent) => void,
    onMouseMove: (event: React.SyntheticEvent) => void,
    onMouseUp: (event: React.SyntheticEvent) => void,
    onClickCapture: (event: React.SyntheticEvent) => void,
    onMouseOut: (event: React.SyntheticEvent) => void,
    onWheel: (event: React.SyntheticEvent) => void
  }
} = usePanZoom({
  container: React.RefObject<HTMLElement>,
  enablePan?: Boolean,
  enableZoom?: Boolean,
  requirePinch?: Boolean,
  preventClickOnPan?: Boolean,
  zoomSensitivity?: Number, // 0 < zoomSensitivity < 1
  minZoom?: Number,
  maxZoom?: Number,
  minX?: Number,
  maxX?: Number,
  minY?: Number,
  maxY?: Number,
  initialZoom?: Number,
  initialPan?: {
    x: Number,
    y: Number
  },
  onPanStart?: (event: React.SyntheticEvent) => void,
  onPan?: (event: React.SyntheticEvent) => void,
  onPanEnd?: (event: React.SyntheticEvent) => void,
  onZoom?: (event: React.SyntheticEvent) => void,
  requireCtrlToZoom: Boolean,
  scrollPanSensitivity?: Number
})
```

Where

```tsx
type Position = { x: Number; y: Number };
```
