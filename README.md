# use-pan-and-zoom

👆+🔎 React hook for panning and zooming a container.

## Quick Start

```jsx
import usePanZoom from "use-pan-and-zoom";

const Demo = () => {
  const panZoomContainer = useRef(null);
  const { transform, panZoomHandlers } = usePanZoom();

  return (
    <div ref={panZoomContainer} {...panZoomHandlers}>
      <div style={{ transform }}>
        <p>👆and 🔎 me!</p>
      </div>
    </div>
  );
};
```

[![Edit react-powerhooks example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/n3rpmj60w0)

## Installation

`yarn add use-pan-and-zoom`

## Requirements

This package is a [React Hook](https://reactjs.org/docs/hooks-intro.html) and therefor requires React 16.8 or newer.

## Usage

usePanZoom takes the following parameters:

```tsx
{
  transform: String,
  pan: {
    x: Number,
    y: Number
  };
  zoom: Number,
  setPan: { x: Number, y: Number } | ({ x: Number, y: Number }) => { x: Number, y: Number }
  setZoom: Number | (zoom: Number) => Number
  panZoomHandlers: {
    onMouseDown: (event: React.SyntheticEvent) => void,
    onMouseMove: (event: React.SyntheticEvent) => void,
    onMouseUp: (event: React.SyntheticEvent) => void,
    onMouseOut: (event: React.SyntheticEvent) => void,
    onWheel: (event: React.SyntheticEvent) => void
  }
} = usePanZoom({
  container: React.RefObject<HTMLElement>,
  enablePan?: Boolean,
  enableZoom?: Boolean,
  requirePinch?: Boolean,
  zoomSensitivity?: Number, // Between 0 and 1
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
  onZoom?: (event: React.SyntheticEvent) => void
})
```
