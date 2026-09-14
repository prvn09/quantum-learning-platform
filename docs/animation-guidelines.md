# Animation Guidelines

- Animate only `transform` and `opacity` for GPU-friendly motion.
- Use `0.3s cubic-bezier(0.4, 0, 0.2, 1)` for interaction feedback.
- Use staggered entry delays of `0.1s` for lesson collections.
- Keep ambient gradient and particle motion slow; it should establish depth, not compete with content.
- Honor `prefers-reduced-motion: reduce` globally.
- Use hover lift on pointer devices and preserve 48px touch targets on mobile.
- Remove or pause costly effects when elements are outside the viewport.
