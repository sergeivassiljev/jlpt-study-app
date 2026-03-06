import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { pageEnter, cardStagger, listItem } from '../../core/animations/page.animations';

interface Book {
  id: string;
  title: string;
  description: string;
  levels: string[];
  icon: string;
  color: string;
  features: string[];
}

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule],
  animations: [pageEnter, cardStagger, listItem],
  template: `
    <div class="min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph" @pageEnter>
      <div class="container mx-auto px-4 py-12 max-w-7xl">
        <!-- Header -->
        <div class="text-center mb-16">
          <h1 class="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark dark:from-primary-dark dark:to-primary">
            Study Materials
          </h1>
          <p class="text-lg text-light-paragraph dark:text-dark-paragraph opacity-75 max-w-2xl mx-auto">
            Curated resources and recommended books for effective JLPT preparation. Find the perfect materials for your level.
          </p>
        </div>

        <!-- Books Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" @cardStagger>
          <div *ngFor="let book of books" @listItem 
               class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary dark:hover:border-primary-dark hover:scale-105 group cursor-pointer">
            <!-- Icon Background -->
            <div [ngClass]="'bg-gradient-to-br ' + book.color" class="h-32 flex items-center justify-center text-6xl">
              {{ book.icon }}
            </div>
            
            <!-- Content -->
            <div class="p-6">
              <h3 class="text-2xl font-bold text-light-headline dark:text-dark-headline mb-2 group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">
                {{ book.title }}
              </h3>
              <p class="text-light-paragraph dark:text-dark-paragraph mb-4 text-sm">{{ book.description }}</p>
              
              <!-- Levels -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span *ngFor="let level of book.levels" 
                      class="px-3 py-1 rounded-full text-xs font-semibold bg-primary dark:bg-primary-dark text-white">
                  {{ level }}
                </span>
              </div>
              
              <!-- Features -->
              <ul class="space-y-2 mb-4">
                <li *ngFor="let feature of book.features" class="text-sm text-light-paragraph dark:text-dark-paragraph flex items-center gap-2">
                  <span class="text-primary dark:text-primary-dark">✓</span>
                  {{ feature }}
                </li>
              </ul>
              
              <!-- CTA Button -->
              <button class="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Learn More
              </button>
            </div>
          </div>
        </div>

        <!-- Resources Section -->
        <div class="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white shadow-2xl mb-12" @pageEnter>
          <h2 class="text-4xl font-bold mb-6">📚 Additional Resources</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white bg-opacity-20 backdrop-blur rounded-xl p-6 hover:bg-opacity-30 transition-all duration-300 hover:scale-105">
              <div class="text-4xl mb-3">🌐</div>
              <h3 class="text-xl font-bold mb-2">Online Platforms</h3>
              <p class="text-sm opacity-90">Access interactive lessons and practice tests online</p>
            </div>
            <div class="bg-white bg-opacity-20 backdrop-blur rounded-xl p-6 hover:bg-opacity-30 transition-all duration-300 hover:scale-105">
              <div class="text-4xl mb-3">👥</div>
              <h3 class="text-xl font-bold mb-2">Study Groups</h3>
              <p class="text-sm opacity-90">Join communities and study with other learners</p>
            </div>
            <div class="bg-white bg-opacity-20 backdrop-blur rounded-xl p-6 hover:bg-opacity-30 transition-all duration-300 hover:scale-105">
              <div class="text-4xl mb-3">🎬</div>
              <h3 class="text-xl font-bold mb-2">Video Courses</h3>
              <p class="text-sm opacity-90">Learn from expert instructors with video tutorials</p>
            </div>
          </div>
        </div>

        <!-- Recommendation Card -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-success transition-all" @pageEnter>
          <div class="flex items-start gap-4">
            <div class="text-5xl">💡</div>
            <div>
              <h3 class="text-2xl font-bold text-light-headline dark:text-dark-headline mb-2">Pro Tip</h3>
              <p class="text-light-paragraph dark:text-dark-paragraph">
                Combine multiple resources for best results. Start with foundational textbooks like "Minna no Nihongo", practice with mock exams, and use online apps for daily reinforcement. Consistency is key to JLPT success!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
  `]
})
export class BooksComponent {
  books: Book[] = [
    {
      id: '1',
      title: 'Kanzen Master Series',
      description: 'Comprehensive guide covering all JLPT levels with detailed explanations and practice exercises.',
      levels: ['N1', 'N2', 'N3', 'N4', 'N5'],
      icon: '📖',
      color: 'from-blue-400 to-blue-600',
      features: [
        'Complete grammar coverage',
        'Vocabulary lists',
        'Practice exercises',
        'Answer keys'
      ]
    },
    {
      id: '2',
      title: 'Minna no Nihongo',
      description: 'Best-selling beginner to intermediate Japanese textbook series used worldwide.',
      levels: ['N4', 'N5'],
      icon: '🎓',
      color: 'from-rose-400 to-red-600',
      features: [
        'Beginner-friendly',
        'Conversational focus',
        'Audio materials',
        'Cultural notes'
      ]
    },
    {
      id: '3',
      title: 'New Complete Master',
      description: 'Focused preparation materials specifically designed for each JLPT level exam.',
      levels: ['N1', 'N2', 'N3'],
      icon: '🎯',
      color: 'from-green-400 to-green-600',
      features: [
        'Level-specific content',
        'Mock exams',
        'Time-management tips',
        'Strategy guide'
      ]
    },
    {
      id: '4',
      title: 'Kanji Master',
      description: 'Specialized resource for mastering kanji characters with stroke order and examples.',
      levels: ['N1', 'N2', 'N3', 'N4', 'N5'],
      icon: '🔤',
      color: 'from-pink-400 to-pink-600',
      features: [
        'Stroke-by-stroke guide',
        'ON/KUN readings',
        'Usage examples',
        'Mnemonics'
      ]
    },
    {
      id: '5',
      title: 'Listening Practice Bundle',
      description: 'Daily listening exercises with native speaker audio for all levels.',
      levels: ['N1', 'N2', 'N3', 'N4', 'N5'],
      icon: '🎧',
      color: 'from-orange-400 to-orange-600',
      features: [
        'Native speaker audio',
        'Transcripts included',
        'Speed variation',
        'Difficulty levels'
      ]
    },
    {
      id: '6',
      title: 'Reading Comprehension Masters',
      description: 'Texts and passages with comprehension questions matching JLPT difficulty.',
      levels: ['N1', 'N2', 'N3'],
      icon: '📰',
      color: 'from-indigo-400 to-indigo-600',
      features: [
        'Authentic texts',
        'Comprehension Q&A',
        'Vocabulary notes',
        'Timed exercises'
      ]
    }
  ];
}
