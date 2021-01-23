import { useCallback, useEffect, useRef } from "react";

import * as _ from "./utils";

import useGetSet from "./useGetSet";
import useForceUpdate from "./useForceUpdate";

const usePanZoom = ({
  enablePan = true,
  enableZoom = true,
  disableWheel: false,
  requireCtrlToZoom = false,
  panOnDrag = true,
  preventClickOnPan = true,
  zoomSensitivity = 0.01,
  scrollPanSensitivity = 1,
  minZoom = 0,
  maxZoom = Infinity,
  minX = -Infinity,
  maxX = Infinity,
  minY = -Infinity,
  maxY = Infinity,
  initialZoom = 1,
  initialPan = { x: 0, y: 0 },
  onPanStart = _.noop,
  onPan = _.noop,
  onPanEnd = _.noop,
  onZoom = _.noop
}) => {
  const container = useRef(null);
  const forceUpdate = useForceUpdate();
  const wasPanning = useRef(false);
  const prev = useRef([]);
  const prevZoom = useRef(1);
  const [getCenter, setCenter] = useGetSet({ top: 0, left: 0 });

  const [isPanning, setPanning] = useGetSet(false);
  const [getTransform, _setTransform] = useGetSet({
    ...initialPan,
    zoom: initialZoom
  });

  const clampX = useCallback(_.clamp(minX, maxX), [minX, maxX]);
  const clampY = useCallback(_.clamp(minY, maxY), [minY, maxY]);
  const clampZoom = useCallback(_.clamp(minZoom, maxZoom), [minZoom, maxZoom]);

  const setTransform = useCallback(v => {
    const r = _setTransform(v);
    const { x, y, zoom } = getTransform();
    setCenter({
      top: (container.current.offsetHeight / 2 - y) / zoom,
      left: (container.current.offsetWidth / 2 - x) / zoom
    });
    forceUpdate();
    return r;
  }, []);

  const setPan = useCallback(
    f =>
      setTransform(({ x, y, zoom }) => {
        const newPan = typeof f === "function" ? f({ x, y }) : f;

        return {
          x: clampX(newPan.x),
          y: clampY(newPan.y),
          zoom
        };
      }),
    [minX, maxX, minY, maxY]
  );

  const setZoom = useCallback(
    (f, maybeCenter) =>
      setTransform(({ x, y, zoom }) => {
        const newZoom = clampZoom(typeof f === "function" ? f(zoom) : f);

        const center = _.maybe(
          () => ({
            x: container.current.offsetWidth / 2,
            y: container.current.offsetHeight / 2
          }),
          _.identity
        )(maybeCenter);

        return {
          x: clampX(x + ((center.x - x) * (zoom - newZoom)) / zoom),
          y: clampY(y + ((center.y - y) * (zoom - newZoom)) / zoom),
          zoom: newZoom
        };
      }),
    [minX, maxX, minY, maxY, minZoom, maxZoom]
  );

  const startPanZoom = useCallback(
    pointers => {
      if (enablePan) {
        prev.current = pointers;

        setPanning(true);

        onPanStart(pointers);
      }
    },
    [enablePan, onPanStart]
  );

  const movePanZoom = useCallback(
    pointers => {
      if (isPanning()) {
        wasPanning.current = true;

        const prevPointers = prev.current;
        prev.current = pointers;

        setPan(({ x, y }) => {
          let dx = 0,
            dy = 0;
          const l = Math.min(pointers.length, prevPointers.length);

          for (let i = 0; i < l; i++) {
            dx += pointers[i].x - prevPointers[i].x;
            dy += pointers[i].y - prevPointers[i].y;
          }

          return {
            x: x + dx / l,
            y: y + dy / l
          };
        });

        onPan(pointers);
      }
    },
    [isPanning, onPan, minX, maxX, minY, maxY]
  );

  const endPanZoom = useCallback(() => {
    if (isPanning()) {
      setPanning(false);
      onPanEnd();
    }
  }, [onPanEnd]);

  const onClickCapture = useCallback(
    event => {
      if ((preventClickOnPan, wasPanning.current)) {
        wasPanning.current = false;
        event.stopPropagation();
      }
    },
    [preventClickOnPan]
  );

  const onWheel = useCallback(
    event => {
      if (enableZoom && container.current) {
        event.preventDefault();
        if (!requireCtrlToZoom || event.ctrlKey) {
          const { pageX, pageY, deltaY } = event;
          const pointerPosition = _.getPositionOnElement(container.current)(
            pageX,
            pageY
          );

          setZoom(
            zoom => zoom * Math.pow(1 - zoomSensitivity, deltaY),
            pointerPosition
          );

          onZoom();
        } else {
          const { deltaX, deltaY } = event;
          setPan(({ x, y }) => ({
            x: x - deltaX,
            y: y - deltaY
          }));
        }
      }
    },
    [
      enableZoom,
      onZoom,
      minX,
      maxX,
      minY,
      maxY,
      minZoom,
      maxZoom,
      scrollPanSensitivity,
      setPan
    ]
  );

  const onGestureStart = useCallback(event => {
    event.preventDefault();
    prevZoom.current = getTransform().zoom;
  }, []);

  const onGesture = useCallback(event => {
    event.preventDefault();

    const { pageX, pageY, scale } = event;
    const pointerPosition = getPositionOnElement(container.current)(
      pageX,
      pageY
    );

    setZoom(prevZoom.current * scale, pointerPosition);

    onZoom();
  }, []);

  const setContainer = useCallback(el => {
    if (el) {
      if (!disableWheel) {
        el.addEventListener("wheel", onWheel);
      }
      el.addEventListener("gesturestart", onGestureStart);
      el.addEventListener("gesturechange", onGesture);
      el.addEventListener("gestureend", onGesture);
    } else if (container.current) {
      return () => {
        if (!disableWheel) {
          container.current.removeEventListener("wheel", onWheel);
        }
        container.current.removeEventListener("gesturestart", onGestureStart);
        container.current.removeEventListener("gesturechange", onGesture);
        container.current.removeEventListener("gestureend", onGesture);
      };
    }
    container.current = el;
  }, [disableWheel]);

  const onTouchStart = ({ touches }) =>
    startPanZoom(
      [...touches].map(({ pageX, pageY }) => ({ x: pageX, y: pageY }))
    );
  const onTouchMove = ({ touches }) =>
    movePanZoom(
      [...touches].map(({ pageX, pageY }) => ({ x: pageX, y: pageY }))
    );
  const onTouchEnd = () => endPanZoom();
  const onTouchCancel = () => endPanZoom();
  const onMouseDown = ({ pageX, pageY }) =>
    startPanZoom([{ x: pageX, y: pageY }]);
  const onMouseMove = ({ pageX, pageY }) =>
    movePanZoom([{ x: pageX, y: pageY }]);
  const onMouseUp = () => endPanZoom();
  const onMouseLeave = () => endPanZoom();

  const transform = getTransform();
  return {
    container,
    setContainer,
    transform: `translate3D(${transform.x}px, ${transform.y}px, 0) scale(${transform.zoom})`,
    center: getCenter(),
    pan: { x: transform.x, y: transform.y },
    zoom: transform.zoom,
    setPan,
    setZoom,
    panZoomHandlers: panOnDrag
      ? {
          onTouchStart,
          onTouchMove,
          onTouchEnd,
          onTouchCancel,
          onMouseDown,
          onMouseMove,
          onMouseUp,
          onMouseLeave,
          onClickCapture
        }
      : {}
  };
};

export default usePanZoom;
