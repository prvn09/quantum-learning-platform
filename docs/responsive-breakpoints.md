# Responsive Breakpoint Strategy

| Range | Strategy |
| --- | --- |
| 320px+ | Single-column content, 48px controls, subtle motion |
| 768px+ | Two-column hero and three-column summary where space allows |
| 1024px+ | Full navigation and lesson grid with comfortable whitespace |
| 1440px+ | Constrain content to 1180px to preserve readable line lengths |

The layout is mobile-first. `clamp()` controls headline and metric sizing without abrupt jumps. Cards collapse to one column below 768px, and ambient effects remain low contrast on small screens.
