import {
  trigger,
  transition,
  style,
  animate,
  state,
  query,
  stagger,
  sequence
} from '@angular/animations';

// Page entrance animation
export const pageEnter = trigger('pageEnter', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
      style({ opacity: 1, transform: 'translateY(0)' })
    )
  ]),
  transition(':leave', [
    animate('300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      style({ opacity: 0, transform: 'translateY(-20px)' })
    )
  ])
]);

// Card stagger animation
export const cardStagger = trigger('cardStagger', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(15px)' }),
      stagger('50ms', [
        animate('400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ])
    ], { optional: true })
  ])
]);

// Button ripple animation
export const buttonRipple = trigger('buttonRipple', [
  state('normal', style({ transform: 'scale(1)', opacity: 1 })),
  state('ripple', style({ transform: 'scale(1)', opacity: 1 })),
  transition('normal => ripple', [
    sequence([
      animate('600ms ease-out', style({ transform: 'scale(4)', opacity: 0 }))
    ])
  ])
]);

// Fade in animation
export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease-out', style({ opacity: 0 }))
  ])
]);

// Scale animation for success/error
export const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({ transform: 'scale(0.5)', opacity: 0 }),
    animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      style({ transform: 'scale(1)', opacity: 1 })
    )
  ])
]);

// Slide in from top
export const slideInTop = trigger('slideInTop', [
  transition(':enter', [
    style({ transform: 'translateY(-100%)', opacity: 0 }),
    animate('400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      style({ transform: 'translateY(0)', opacity: 1 })
    )
  ])
]);

// Bounce animation
export const bounce = trigger('bounce', [
  state('normal', style({ transform: 'translateY(0)' })),
  state('bouncing', style({ transform: 'translateY(0)' })),
  transition('normal => bouncing', [
    animate('1s', style({ transform: 'translateY(-20px)' })),
    animate('400ms', style({ transform: 'translateY(0)' }))
  ])
]);

// List item animation
export const listItem = trigger('listItem', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(-20px)' }),
    animate('300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      style({ opacity: 1, transform: 'translateX(0)' })
    )
  ])
]);

// Expand collapse animation
export const expandCollapse = trigger('expandCollapse', [
  state('collapsed', style({ height: '0', opacity: 0, overflow: 'hidden' })),
  state('expanded', style({ height: '*', opacity: 1, overflow: 'visible' })),
  transition('collapsed <=> expanded', [
    animate('300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)')
  ])
]);
