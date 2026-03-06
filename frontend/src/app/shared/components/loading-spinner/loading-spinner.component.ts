import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center" [class.py-8]="!inline" [class.py-2]="inline">
      <div class="relative" [style.width.px]="size" [style.height.px]="size">
        <!-- Outer ring -->
        <div class="absolute inset-0 rounded-full border-4 border-secondary/20 dark:border-success/20"></div>
        <!-- Spinning ring -->
        <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-primary dark:border-t-primary-dark animate-spin"></div>
        <!-- Inner sakura dot (optional decorative element) -->
        <div *ngIf="!minimal" class="absolute inset-0 flex items-center justify-center">
          <div class="w-2 h-2 rounded-full bg-primary dark:bg-primary-dark animate-pulse"></div>
        </div>
      </div>
      <p *ngIf="message" class="mt-3 text-sm text-light-paragraph dark:text-dark-paragraph" [class.text-xs]="inline">
        {{ message }}
      </p>
    </div>
  `,
  styles: [`
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.4;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: number = 40;
  @Input() message: string = '';
  @Input() inline: boolean = false;
  @Input() minimal: boolean = false;
}
