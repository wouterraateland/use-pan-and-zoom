# use-pan-and-zoom

👆+🔎 React hook for panning and zooming a container.

Supports touch devices since version 0.4.0.

## Installation

`yarn add use-pan-and-zoom` / `npm install use-pan-and-zoom --save`

## Requirements

This package is a [React Hook](https://reactjs.org/docs/hooks-intro.html) and therefor requires React 16.8 or newer.

## Quick Start

```jsx
import usePanZoom from "use-pan-and-zoom";

export default function Demo() {
  const { transform, setContainer, panZoomHandlers } = usePanZoom();

  return (
    <div
      ref={(el) => setContainer(el)}
      style={{ touchAction: "none" }}
      {...panZoomHandlers}
    >
      <div style={{ transform }}>
        <p>Drag to 👆 and scroll / pinch to 🔎 me!</p>
      </div>
    </div>
  );
}
```

[![Edit use-pan-and-zoom example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/n3rpmj60w0)

## Parameters

All parameters are optional

| Parameter           | Type                                                  | Default          |
| ------------------- | ----------------------------------------------------- | ---------------- |
| `enablePan`         | `boolean`                                             | `true`           |
| `enableZoom`        | `boolean`                                             | `true`           |
| `requireCtrlToZoom` | `boolean`                                             | `false`          |
| `disableWheel`      | `boolean`                                             | `false`          |
| `panOnDrag`         | `boolean`                                             | `true`           |
| `preventClickOnPan` | `boolean`                                             | `true`           |
| `zoomSensitivity`   | `number`                                              | `0.01`           |
| `minZoom`           | `number`                                              | `0`              |
| `maxZoom`           | `number`                                              | `Infinity`       |
| `minX`              | `number`                                              | `-Infinity`      |
| `maxX`              | `number`                                              | `Infinity`       |
| `minY`              | `number`                                              | `-Infinity`      |
| `maxY`              | `number`                                              | `Infinity`       |
| `initialZoom`       | `number`                                              | `1`              |
| `initialPan`        | `position`                                            | `{ x: 0, y: 0 }` |
| `onPanStart`        | `(touches: position[], transform: transform) => void` | `() => {}`       |
| `onPan`             | `(touches: position[], transform: transform) => void` | `() => {}`       |
| `onPanEnd`          | `() => void`                                          | `() => {}`       |
| `onZoom`            | `(transform: transform) => void`                      | `() => {}`       |

Where:

- `position = { x: number, y: number }`
- `transform = { x: number, y: number, zoom: number }`

## Output

| Field             | Type                            | Description                                            |
| ----------------- | ------------------------------- | ------------------------------------------------------ |
| `container`       | `HTMLElement \| null`           | Current container element                              |
| `setContainer`    | `(HTMLElement \| null) => void` | Sets the container element                             |
| `transform`       | `string`                        | CSS string determining the transform                   |
| `center`          | `position`                      | Center of container element                            |
| `pan`             | `position`                      | Current pixels panned                                  |
| `zoom`            | `number`                        | Current zoom                                           |
| `setPan`          | `(pan: position) => void`       | Set pan imperatively                                   |
| `setZoom`         | `(zoom: number) => void`        | Set zoom imperatively                                  |
| `panZoomHandlers` | `{ ...EventHandler }`           | Pass to container element to listen to relevant events |
