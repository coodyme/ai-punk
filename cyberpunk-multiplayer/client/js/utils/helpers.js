export function generateUniqueId() {
    return 'id-' + Math.random().toString(36).substr(2, 16);
}

export function calculateDistance(pointA, pointB) {
    const dx = pointB.x - pointA.x;
    const dy = pointB.y - pointA.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}