const STABLE_MS = 180;
const LOST_MS = 180;
const SWIPE_WINDOW_MS = 260;
const SWIPE_COOLDOWN_MS = 480;
const SWIPE_DELTA_X = 0.085;
const SWIPE_RATIO = 1.35;

export class StableGestureDetector {
  constructor() {
    this.current = 'none';
    this.startedAt = 0;
    this.confirmed = 'none';
    this.confirmedAt = 0;
  }

  update(rawGesture, now = performance.now()) {
    const gesture = rawGesture || 'none';
    if (gesture !== this.current) {
      this.current = gesture;
      this.startedAt = now;
      if (gesture === 'none') this.confirmed = 'none';
    }

    const heldFor = now - this.startedAt;
    if (gesture !== 'none' && heldFor >= STABLE_MS) {
      this.confirmed = gesture;
      this.confirmedAt = now;
    }

    if (gesture === 'none' && heldFor > LOST_MS) {
      this.confirmed = 'none';
    }

    return {
      raw: gesture,
      stable: this.confirmed,
      progress: gesture === 'none' ? 0 : Math.min(1, heldFor / STABLE_MS),
    };
  }

  reset() {
    this.current = 'none';
    this.startedAt = 0;
    this.confirmed = 'none';
    this.confirmedAt = 0;
  }
}

export class SwipeGestureDetector {
  constructor() {
    this.history = [];
    this.lastTriggerAt = 0;
  }

  update(marker, now = performance.now()) {
    if (!marker) {
      this.history = [];
      return { gesture: 'none', dx: 0, dy: 0 };
    }

    this.history.push({ x: marker.x, y: marker.y, t: now });
    this.history = this.history.filter((item) => now - item.t <= SWIPE_WINDOW_MS);
    if (this.history.length < 2) return { gesture: 'none', dx: 0, dy: 0 };

    const first = this.history[0];
    const last = this.history[this.history.length - 1];
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (now - this.lastTriggerAt < SWIPE_COOLDOWN_MS) {
      return { gesture: 'none', dx, dy };
    }

    if (absX >= SWIPE_DELTA_X && absX > absY * SWIPE_RATIO) {
      this.lastTriggerAt = now;
      this.history = [last];
      return { gesture: dx > 0 ? 'D' : 'I', dx, dy };
    }

    return { gesture: 'none', dx, dy };
  }

  reset() {
    this.history = [];
    this.lastTriggerAt = 0;
  }
}

export function detectHandsGesture(result) {
  const hands = result?.landmarks || [];
  const handedness = result?.handednesses || result?.handedness || [];
  let confidence = 0;
  let bestMarker = null;
  let bestSwipeMarker = null;

  hands.forEach((points, index) => {
    const handInfo = handedness[index]?.[0] || handedness[index]?.categories?.[0] || {};
    const label = handInfo.categoryName || handInfo.displayName || handInfo.label || '';
    const score = Number(handInfo.score || 0.65);
    const active = isHandVisible(points);
    if (!active) return;
    const marker = fingerMarker(points);
    if (!marker) return;
    const mirrored = { x: 1 - marker.x, y: marker.y };
    if (!bestMarker || score >= confidence || label.toLowerCase().includes('right')) {
      confidence = Math.max(confidence, score);
      bestMarker = marker;
      bestSwipeMarker = mirrored;
    }
  });

  return {
    gesture: 'none',
    confidence,
    marker: bestMarker,
    swipeMarker: bestSwipeMarker,
  };
}

export function detectFaceGesture(result) {
  const face = result?.faceLandmarks?.[0] || result?.landmarks?.[0];
  if (!face) return { gesture: 'none', confidence: 0 };

  const leftEye = face[33];
  const rightEye = face[263];
  const nose = face[1] || face[4];
  if (!leftEye || !rightEye || !nose) return { gesture: 'none', confidence: 0.2 };

  const eyeCenterX = (leftEye.x + rightEye.x) / 2;
  const faceWidth = Math.max(0.001, Math.abs(rightEye.x - leftEye.x));
  const offset = (nose.x - eyeCenterX) / faceWidth;
  const abs = Math.abs(offset);

  if (abs < 0.1) return { gesture: 'A', confidence: 0.62 };
  if (offset > 0.1) return { gesture: 'D', confidence: Math.min(0.95, abs) };
  return { gesture: 'I', confidence: Math.min(0.95, abs) };
}

function isHandVisible(points) {
  return Boolean(points?.[0] && points?.[5] && points?.[8] && points?.[9] && points?.[12]);
}

function fingerMarker(points) {
  const indexTip = points[8];
  const middleTip = points[12];
  const indexMcp = points[5];
  const middleMcp = points[9];
  if (!indexTip || !middleTip || !indexMcp || !middleMcp) return null;
  return {
    x: (indexTip.x + middleTip.x + indexMcp.x + middleMcp.x) / 4,
    y: (indexTip.y + middleTip.y + indexMcp.y + middleMcp.y) / 4,
  };
}
