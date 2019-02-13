import { useState } from "react";

const clamp = (min, max) => value => Math.max(min, Math.min(value, max));
const noop = () => {};

const getOffset = el => {
  if (el) {
    const { left, top } = getOffset(el.offsetParent);
    return { left: left + el.offsetLeft, top: top + el.offsetTop };
  } else {
    return { left: 0, top: 0 };
  }
};

function getPointer(pageX, pageY, el) {
  const { left, top } = getOffset(el);
  return {
    x: pageX - left,
    y: pageY - top
  };
}

const usePanZoom = ({
  container,
  enablePan = true,
  enableZoom = true,
  requirePinch = false,
  minZoom = 0,
  maxZoom = Infinity,
  minX = -Infinity,
  maxX = Infinity,
  minY = -Infinity,
  maxY = Infinity,
  initialZoom = 1,
  initialPan = { x: 0, y: 0 },
  onPanStart = noop,
  onPan = noop,
  onPanEnd = noop,
  onZoom = noop
}) => {
  if (container === undefined) {
    throw Error("Container cannot be empty and should be a ref");
  }

  const [isPanning, setPanning] = useState(false);
  const [transform, setTransform] = useState({
    ...initialPan,
    zoom: initialZoom
  });
  const [prev, setPrev] = useState({ x: 0, y: 0 });

  function onMouseDown(event) {
    if (enablePan) {
      setPanning(true);
      setPrev({ x: event.pageX, y: event.pageY });

      onPanStart(event);

      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      event.preventDefault();
    }
  }

  function onMouseMove(event) {
    const { pageX, pageY } = event;
    if (isPanning) {
      setTransform(({ x, y, zoom }) => ({
        x: clamp(minX, maxX)(x + pageX - prev.x),
        y: clamp(minY, maxY)(y + pageY - prev.y),
        zoom
      }));

      onPan(event);
    }
    setPrev({ x: pageX, y: pageY });
  }

  function onMouseUp(event) {
    if (isPanning) {
      onPanEnd(event);
    }
    setPanning(false);
  }

  function onMouseOut(event) {
    if (isPanning) {
      onPanEnd(event);
    }
    setPanning(false);
  }

  function onWheel(event) {
    event.preventDefault();
    if (enableZoom && container.current && (!requirePinch || event.ctrlKey)) {
      const { pageX, pageY, deltaY } = event;
      setTransform(({ x, y, zoom }) => {
        const pointerPosition = getPointer(pageX, pageY, container.current);
        const newZoom = clamp(minZoom, maxZoom)(zoom * Math.pow(0.99, deltaY));

        return {
          x: clamp(minX, maxX)(
            x + ((pointerPosition.x - x) * (zoom - newZoom)) / zoom
          ),
          y: clamp(minY, maxY)(
            y + ((pointerPosition.y - y) * (zoom - newZoom)) / zoom
          ),
          zoom: newZoom
        };
      });
      onZoom(event);
    }
  }

  return {
    transform: `translate3D(${transform.x}px, ${transform.y}px, 0) scale(${
      transform.zoom
    })`,
    pan: { x: transform.x, y: transform.y },
    zoom: transform.zoom,
    panZoomHandlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseOut,
      onWheel
    }
  };
};

export default usePanZoom;
