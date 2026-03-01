import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SrsService } from './core/services/srs.service';
import { ThemeService, Theme } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = '日本語学習';
  dueCount = 0;
  currentTheme: Theme = 'light';

  constructor(
    private srsService: SrsService,
    public themeService: ThemeService
  ) { }

  ngOnInit(): void {
    // Update due count when flashcards change
    this.srsService.flashcards$.subscribe(() => {
      this.dueCount = this.srsService.getDueCount();
    });

    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
