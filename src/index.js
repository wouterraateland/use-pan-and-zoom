import { useState } from "react";

const clamp = (min, max) => value => Math.max(min, Math.min(value, max));
const identity = x => x;
const noop = () => {};
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));
const maybe = (f, g) => v => (v === null || v === undefined ? f() : g(v));
const snd = g => ([x, y]) => [x, g(y)];
const toPair = v => [v, v];

const getOffset = maybe(
  () => ({ left: 0, top: 0 }),
  compose(
    ([el, { left, top }]) => ({
      left: left + el.offsetLeft,
      top: top + el.offsetTop
    }),
    snd(el => getOffset(el.offsetParent)),
    toPair
  )
);

const getPositionOnElement = compose(
  ({ left, top }) => (x, y) => ({
    x: x - left,
    y: y - top
  }),
  getOffset
);

const isChildOf = (child, parent) =>
  !!(child && parent) &&
  (child === parent || isChildOf(child.parentElement, parent));

const usePanZoom = ({
  container,
  enablePan = true,
  enableZoom = true,
  requirePinch = false,
  zoomSensitivity = 0.01,
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

  const setPan = f =>
    setTransform(({ x, y, zoom }) => {
      const newPan = typeof f === "function" ? f({ x, y }) : f;

      return {
        x: clamp(minX, maxX)(newPan.x),
        y: clamp(minY, maxY)(newPan.y),
        zoom
      };
    });

  const setZoom = (f, maybeCenter) =>
    setTransform(({ x, y, zoom }) => {
      const newZoom = clamp(minZoom, maxZoom)(
        typeof f === "function" ? f(zoom) : f
      );

      const center = maybe(
        () => ({
          x: container.current.offsetWidth / 2,
          y: container.current.offsetHeight / 2
        }),
        identity
      )(maybeCenter);

      return {
        x: clamp(minX, maxX)(x + ((center.x - x) * (zoom - newZoom)) / zoom),
        y: clamp(minY, maxY)(y + ((center.y - y) * (zoom - newZoom)) / zoom),
        zoom: newZoom
      };
    });

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
    if (isPanning) {
      const { pageX, pageY } = event;
      setPan(({ x, y }) => ({
        x: x + pageX - prev.x,
        y: y + pageY - prev.y
      }));
      setPrev({ x: pageX, y: pageY });

      onPan(event);
    }
  }

  function onMouseUp(event) {
    if (isPanning) {
      onPanEnd(event);
      setPanning(false);
    }
  }

  function onMouseOut(event) {
    if (isPanning && !isChildOf(event.relatedTarget, container.current)) {
      onPanEnd(event);
      setPanning(false);
    }
  }

  function onWheel(event) {
    event.preventDefault();
    if (enableZoom && container.current && (!requirePinch || event.ctrlKey)) {
      const { pageX, pageY, deltaY } = event;
      const pointerPosition = getPositionOnElement(container.current)(
        pageX,
        pageY
      );

      setZoom(
        zoom => zoom * Math.pow(1 - zoomSensitivity, deltaY),
        pointerPosition
      );

      onZoom(event);
    }
  }

  return {
    transform: `translate3D(${transform.x}px, ${transform.y}px, 0) scale(${
      transform.zoom
    })`,
    pan: { x: transform.x, y: transform.y },
    zoom: transform.zoom,
    setPan,
    setZoom,
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
