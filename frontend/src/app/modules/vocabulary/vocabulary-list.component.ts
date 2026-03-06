import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VocabularyService } from '../../core/services/vocabulary.service';
import { SrsService } from '../../core/services/srs.service';
import { BookService } from '../../core/services/book.service';
import { FolderService } from '../../core/services/folder.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { VocabularyItem, Word, VocabularyFolder } from '../../core/models/index';
import { pageEnter, cardStagger, listItem, fadeIn, scaleIn } from '../../core/animations/page.animations';

@Component({
  selector: 'app-vocabulary-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  animations: [pageEnter, cardStagger, listItem, fadeIn, scaleIn],
  template: `
    <div class="themed-page min-h-screen transition-colors duration-300 bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph" @pageEnter>
      <div class="container mx-auto px-4 py-8">
        <div class="flex gap-6">
          <!-- Folder Sidebar -->
          <div class="w-64 flex-shrink-0">
            <div class="rounded-xl shadow-lg border-2 border-primary/20 dark:border-primary-dark/20 bg-gradient-to-br from-white to-primary/5 dark:from-slate-800 dark:to-primary-dark/5 p-4 transition-colors sticky top-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-lg">
                  <span class="inline-block">📁</span>
                  <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark dark:from-primary-dark dark:to-primary">Folders</span>
                </h3>
                <button (click)="toggleCreateFolderForm()"
                        class="text-2xl hover:scale-125 transition-transform duration-300 text-primary dark:text-primary-dark hover:rotate-90"
                        title="Create folder">
                  +
                </button>
              </div>

              <!-- Create Folder Form -->
              <div *ngIf="showCreateFolderForm" @scaleIn
                   class="mb-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary-dark/10 dark:from-primary-dark/10 dark:to-primary/10 border border-primary/30 dark:border-primary-dark/30">
                <input [(ngModel)]="newFolderName"
                       class="w-full mb-3 px-3 py-2 text-sm rounded-lg border-2 border-primary/30 dark:border-primary-dark/30 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark transition-all"
                       placeholder="Folder name">
                <div class="mb-3">
                  <p class="text-xs font-bold mb-2 text-light-paragraph dark:text-dark-paragraph">Choose color:</p>
                  <div class="grid grid-cols-8 gap-1.5">
                    <button *ngFor="let color of predefinedColors"
                            (click)="newFolderColor = color"
                            [style.background-color]="color"
                            [class.ring-4]="newFolderColor === color"
                            [class.ring-offset-2]="newFolderColor === color"
                            [class.ring-primary]="newFolderColor === color"
                            [class.scale-125]="newFolderColor === color"
                            class="w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-all shadow-md"
                            [title]="color">
                    </button>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button (click)="createFolder()"
                          class="flex-1 px-3 py-2 text-xs rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 transition-all font-bold shadow-md hover:shadow-lg hover:scale-105">
                    Create
                  </button>
                  <button (click)="toggleCreateFolderForm()"
                          class="flex-1 px-3 py-2 text-xs rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-all font-bold shadow-md hover:scale-105">
                    Cancel
                  </button>
                </div>
              </div>

              <!-- All Words -->
              <button (click)="selectFolder(null)"
                      (dragover)="onDragOver($event, null)"
                      (dragleave)="onDragLeave()"
                      (drop)="onDrop($event, null)"
                      [class.bg-gradient-to-r]="selectedFolderId === null"
                      [class.from-primary]="selectedFolderId === null"
                      [class.to-primary-dark]="selectedFolderId === null"
                      [class.text-white]="selectedFolderId === null"
                      [class.shadow-lg]="selectedFolderId === null"
                      [class.scale-105]="selectedFolderId === null"
                      [class.ring-4]="dragOverFolderId === null && draggedWordId !== null"
                      [class.ring-primary]="dragOverFolderId === null && draggedWordId !== null"
                      [class.ring-offset-2]="dragOverFolderId === null && draggedWordId !== null"
                      class="w-full text-left px-4 py-3 rounded-xl mb-2 hover:bg-light-bg dark:hover:bg-slate-700 transition-all duration-300 text-sm font-bold hover:scale-105 hover:shadow-md">
                All Words <span class="opacity-75">({{ getFolderWordsCount(null) }})</span>
              </button>

              <!-- Folder List -->
              <div *ngFor="let folder of folders" class="mb-2 group relative">
                <button (click)="selectFolder(folder.id)"
                        (dragover)="onDragOver($event, folder.id)"
                        (dragleave)="onDragLeave()"
                        (drop)="onDrop($event, folder.id)"
                        [class.bg-gradient-to-r]="selectedFolderId === folder.id"
                        [class.from-primary]="selectedFolderId === folder.id"
                        [class.to-primary-dark]="selectedFolderId === folder.id"
                        [class.text-white]="selectedFolderId === folder.id"
                        [class.shadow-lg]="selectedFolderId === folder.id"
                        [class.scale-105]="selectedFolderId === folder.id"
                        [class.ring-4]="dragOverFolderId === folder.id"
                        [class.ring-primary]="dragOverFolderId === folder.id"
                        [class.ring-offset-2]="dragOverFolderId === folder.id"
                        class="w-full text-left pl-4 pr-12 py-3 rounded-xl hover:bg-light-bg dark:hover:bg-slate-700 transition-all duration-300 text-sm flex items-center gap-2 font-bold hover:scale-105 hover:shadow-md">
                  <span class="w-4 h-4 rounded-full flex-shrink-0 shadow-md" [style.backgroundColor]="folder.color"></span>
                  <span class="flex-1 truncate">{{ folder.name }}</span>
                  <span class="text-xs opacity-70 font-normal">({{ getFolderWordsCount(folder.id) }})</span>
                </button>
                <button (click)="confirmDeleteFolder(folder.id); $event.stopPropagation()"
                        class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-600 hover:text-white hover:bg-red-600 text-xl px-2 py-1 leading-none rounded-lg transition-all hover:scale-125"
                        title="Delete folder">
                  ×
                </button>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="flex-1 min-w-0">
            <!-- Header Section with Gradient -->
            <div class="mb-8 text-center">
              <h1 class="text-4xl font-bold mb-3">
                <span class="inline-block text-3xl">📚</span>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark dark:from-primary-dark dark:to-primary">My Vocabulary</span>
              </h1>
              <div class="flex items-center justify-center gap-3 mb-4">
                <div class="px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-primary-dark/20 dark:from-primary-dark/20 dark:to-primary/20 backdrop-blur-sm">
                  <p class="text-base font-semibold">
                    <span class="text-primary dark:text-primary-dark font-bold text-xl">{{ vocabulary.length }}</span>
                    <span class="opacity-70"> / 10,000 words saved</span>
                  </p>
                </div>
                <span *ngIf="vocabulary.length >= 10000" @scaleIn
                      class="px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-bold shadow-lg">
                  <span class="inline-block">🎯</span> Limit reached
                </span>
              </div>
              <p class="text-sm text-light-paragraph dark:text-dark-paragraph opacity-75 max-w-2xl mx-auto">
                Build your personal word collection and master Japanese vocabulary with spaced repetition learning
              </p>
            </div>

            <!-- View Mode Toggle & Filters -->
            <div class="flex justify-between items-center mb-6 gap-4 flex-wrap">
              <div class="flex gap-2" @cardStagger>
                <button (click)="filter = 'all'" @listItem
                        [ngClass]="filter === 'all' 
                          ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg scale-105' 
                          : 'bg-white dark:bg-slate-800 text-light-headline dark:text-dark-headline hover:shadow-md hover:scale-105'"
                        class="px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm border-2 border-transparent hover:border-primary dark:hover:border-primary-dark">
                  All <span class="opacity-80">({{ vocabulary.length }})</span>
                </button>
                <button (click)="filter = 'new'" @listItem
                        [ngClass]="filter === 'new'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105'
                          : 'bg-white dark:bg-slate-800 text-light-headline dark:text-dark-headline hover:shadow-md hover:scale-105'"
                        class="px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm border-2 border-transparent hover:border-yellow-500">
                  <span class="inline-block">⭐</span> New <span class="opacity-80">({{ newCount }})</span>
                </button>
                <button (click)="filter = 'toBeReviewed'" @listItem
                        [ngClass]="filter === 'toBeReviewed'
                          ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg scale-105'
                          : 'bg-white dark:bg-slate-800 text-light-headline dark:text-dark-headline hover:shadow-md hover:scale-105'"
                        class="px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm border-2 border-transparent hover:border-blue-500">
                  <span class="inline-block">🔔</span> To Review <span class="opacity-80">({{ toBeReviewedCount }})</span>
                </button>
                <button (click)="filter = 'reviewed'" @listItem
                        [ngClass]="filter === 'reviewed'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                          : 'bg-white dark:bg-slate-800 text-light-headline dark:text-dark-headline hover:shadow-md hover:scale-105'"
                        class="px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm border-2 border-transparent hover:border-green-500">
                  ✓ Reviewed <span class="opacity-80">({{ reviewedCount }})</span>
                </button>
              </div>
              
              <div class="flex gap-2">
                <button (click)="viewMode = 'list'"
                        [ngClass]="viewMode === 'list'
                          ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg'
                          : 'bg-white dark:bg-slate-800 text-light-headline dark:text-dark-headline hover:shadow-md'"
                        class="px-3 py-2 rounded-xl transition-all duration-300 font-semibold text-sm hover:scale-105"
                        title="List view">
                  ≡ List
                </button>
                <button (click)="viewMode = 'card'"
                        [ngClass]="viewMode === 'card'
                          ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg'
                          : 'bg-white dark:bg-slate-800 text-light-headline dark:text-dark-headline hover:shadow-md'"
                        class="px-3 py-2 rounded-xl transition-all duration-300 font-semibold text-sm hover:scale-105"
                        title="Card view">
                  ⊞ Card
                </button>
              </div>
            </div>

            <!-- Search Input -->
            <div class="mb-6">
              <div class="relative max-w-2xl mx-auto">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-xl inline-block">🔍</span>
                </div>
                <input [(ngModel)]="searchTerm"
                       class="w-full rounded-xl pl-11 pr-4 py-3 border-2 border-primary/20 dark:border-primary-dark/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary-dark/30 focus:border-primary dark:focus:border-primary-dark bg-white dark:bg-slate-800 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500 shadow-md hover:shadow-lg"
                       placeholder="Search your vocabulary...">
              </div>
            </div>

            <!-- Add Word Button -->
            <div class="mb-6 text-center">
              <button (click)="toggleAddWordForm()"
                      [ngClass]="showAddWordForm
                        ? 'bg-white dark:bg-slate-800 text-primary dark:text-primary-dark border-primary dark:border-primary-dark'
                        : 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-xl hover:scale-105'"
                      class="px-6 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-lg border-2">
                <span class="inline-block">{{ showAddWordForm ? '✖' : '➕' }}</span> {{ showAddWordForm ? 'Hide Form' : 'Add New Word' }}
              </button>
            </div>

        <!-- Add Custom Vocabulary Form -->
        <div *ngIf="showAddWordForm" @scaleIn
             class="rounded-xl shadow-xl p-6 border-2 border-primary/30 dark:border-primary-dark/30 mb-8 bg-gradient-to-br from-white to-primary/5 dark:from-slate-800 dark:to-primary-dark/5 transition-colors max-w-3xl mx-auto">
          <div class="text-center mb-4">
            <h2 class="text-2xl font-bold mb-2">
              <span class="inline-block text-xl">✨</span>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark dark:from-primary-dark dark:to-primary">Add Your Own Word</span>
            </h2>
            <p class="text-light-paragraph dark:text-dark-paragraph opacity-75">
              Add kanji, kana-only words, or any term you want to study
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-bold mb-2 text-light-headline dark:text-dark-headline">Word *</label>
              <input [(ngModel)]="customWordText"
                     class="w-full rounded-xl px-4 py-3 border-2 border-primary/20 dark:border-primary-dark/20 transition-all focus:outline-none focus:ring-4 focus:ring-primary/30 dark:focus:ring-primary-dark/30 focus:border-primary dark:focus:border-primary-dark bg-white dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500"
                     placeholder="e.g. ねこ / 猫">
            </div>
            <div>
              <label class="block text-sm font-bold mb-2 text-light-headline dark:text-dark-headline">Reading</label>
              <input [(ngModel)]="customWordReading"
                     class="w-full rounded-xl px-4 py-3 border-2 border-primary/20 dark:border-primary-dark/20 transition-all focus:outline-none focus:ring-4 focus:ring-primary/30 dark:focus:ring-primary-dark/30 focus:border-primary dark:focus:border-primary-dark bg-white dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500"
                     placeholder="Optional if kana-only">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-bold mb-2 text-light-headline dark:text-dark-headline">Meaning *</label>
              <input [(ngModel)]="customWordMeaning"
                     class="w-full rounded-xl px-4 py-3 border-2 border-primary/20 dark:border-primary-dark/20 transition-all focus:outline-none focus:ring-4 focus:ring-primary/30 dark:focus:ring-primary-dark/30 focus:border-primary dark:focus:border-primary-dark bg-white dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500"
                     placeholder="English meaning">
            </div>
            <div>
              <label class="block text-sm font-bold mb-2 text-light-headline dark:text-dark-headline">Part of Speech</label>
              <input [(ngModel)]="customPartOfSpeech"
                     class="w-full rounded-xl px-4 py-3 border-2 border-primary/20 dark:border-primary-dark/20 transition-all focus:outline-none focus:ring-4 focus:ring-primary/30 dark:focus:ring-primary-dark/30 focus:border-primary dark:focus:border-primary-dark bg-white dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500"
                     placeholder="e.g. noun, verb, adjective">
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-bold mb-2 text-light-headline dark:text-dark-headline">Example Sentence</label>
            <textarea [(ngModel)]="customExampleSentence"
                      rows="3"
                      class="w-full rounded-xl px-4 py-3 border-2 border-primary/20 dark:border-primary-dark/20 transition-all focus:outline-none focus:ring-4 focus:ring-primary/30 dark:focus:ring-primary-dark/30 focus:border-primary dark:focus:border-primary-dark bg-white dark:bg-slate-700 text-light-paragraph dark:text-dark-paragraph placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Add an example sentence (optional)"></textarea>
          </div>

          <div class="flex items-center gap-4 justify-center">
            <button (click)="addCustomWord()"
                    [disabled]="!customWordText.trim() || !customWordMeaning.trim() || vocabulary.length >= 10000"
                    class="px-6 py-2.5 rounded-xl transition-all duration-300 font-semibold bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
              <span class="inline-block">➕</span> Add Word
            </button>
            <p *ngIf="customWordAddedMessage" @scaleIn
               class="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 text-white text-sm font-semibold shadow-md">
              {{ customWordAddedMessage }}
            </p>
            <p *ngIf="customWordErrorMessage" @scaleIn
               class="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-semibold shadow-md">
              {{ customWordErrorMessage }}
            </p>
          </div>
        </div>

        <!-- View: List -->
        <div *ngIf="viewMode === 'list' && filteredVocabulary.length > 0" class="space-y-3" @cardStagger>
          <div *ngFor="let item of filteredVocabulary" @listItem
               [class.opacity-50]="draggedWordId === item.id"
               class="group rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 border-2 border-transparent hover:border-primary/50 dark:hover:border-primary-dark/50 bg-gradient-to-r from-white to-primary/5 dark:from-slate-800 dark:to-primary-dark/5 hover:scale-[1.01] flex gap-3">
            <!-- Drag Handle -->
            <div [draggable]="true"
                 (dragstart)="onDragStart(item.id, $event)"
                 (dragend)="onDragEnd()"
                 class="flex-shrink-0 cursor-grab active:cursor-grabbing flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary/10 dark:hover:bg-primary-dark/10 transition-all text-gray-400 hover:text-primary dark:hover:text-primary-dark group-hover:scale-110"
                 title="Drag to move to folder">
              <span class="text-xl">⋮⋮</span>
            </div>
            <div class="flex justify-between items-start gap-4 flex-1">
              <div class="flex-1 min-w-0">
                <h3 class="text-2xl font-bold transition-colors text-transparent bg-clip-text bg-gradient-to-r from-light-headline to-primary dark:from-dark-headline dark:to-primary-dark mb-1">
                  {{ item.word.text }}
                </h3>
                <p class="text-base mb-2 font-semibold transition-colors text-primary dark:text-primary-dark">
                  {{ item.word.reading }}
                </p>
                <p class="mb-2 transition-colors text-light-paragraph dark:text-dark-paragraph">
                  {{ item.word.meaning }}
                </p>
                <p *ngIf="!isFromBook(item.exampleSentence)"
                   class="text-sm italic opacity-75 transition-colors text-light-paragraph dark:text-dark-paragraph bg-light-bg dark:bg-slate-700 p-3 rounded-lg">
                  {{ item.exampleSentence }}
                </p>
                <p *ngIf="isFromBook(item.exampleSentence)"
                   class="text-sm bg-gradient-to-r from-primary/10 to-primary-dark/10 dark:from-primary-dark/10 dark:to-primary/10 p-3 rounded-lg">
                  <span class="text-light-paragraph dark:text-dark-paragraph opacity-75">📖 From: </span>
                  <button (click)="navigateToBook(item.exampleSentence)"
                          class="font-bold underline transition-colors cursor-pointer text-primary dark:text-primary-dark hover:opacity-70">
                    {{ getBookInfo(item.exampleSentence)?.bookTitle }} - {{ getBookInfo(item.exampleSentence)?.chapterTitle }}
                  </button>
                </p>
              </div>
              <div class="flex flex-col items-end gap-2 flex-shrink-0">
                <span [ngClass]="getWordStatus(item) === 'reviewed'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white'
                        : getWordStatus(item) === 'toBeReviewed'
                        ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'"
                      class="inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-md transition-all hover:scale-110">
                  <span class="inline-block" *ngIf="getWordStatus(item) === 'reviewed'">✓</span>
                  <span class="inline-block" *ngIf="getWordStatus(item) === 'toBeReviewed'">🔔</span>
                  <span class="inline-block" *ngIf="getWordStatus(item) === 'new'">⭐</span>
                  {{ getWordStatus(item) === 'reviewed' ? 'Reviewed' : getWordStatus(item) === 'toBeReviewed' ? 'To Review' : 'New' }}
                </span>
                <div class="flex gap-2">
                  <button (click)="scheduleForReview(item.id)"
                      class="px-3 py-1.5 rounded-lg transition-all duration-300 font-semibold text-xs bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-md hover:shadow-lg hover:scale-110"
                          title="Review this word now">
                    <span class="inline-block">⚡</span> Review
                  </button>
                  <button (click)="confirmDelete(item.id)"
                          class="px-3 py-1.5 rounded-lg transition-all duration-300 font-semibold text-xs bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md hover:shadow-lg hover:scale-110">
                    <span class="inline-block">🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- View: Card Grid -->
        <div *ngIf="viewMode === 'card' && filteredVocabulary.length > 0" 
             class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" @cardStagger>
          <div *ngFor="let item of filteredVocabulary" @listItem
               [class.opacity-50]="draggedWordId === item.id"
               class="group rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 border-2 border-transparent hover:border-primary/50 dark:hover:border-primary-dark/50 bg-gradient-to-br from-white via-white to-primary/5 dark:from-slate-800 dark:via-slate-800 dark:to-primary-dark/5 flex flex-col relative hover:scale-105">
            <!-- Drag Handle -->
            <div [draggable]="true"
                 (dragstart)="onDragStart(item.id, $event)"
                 (dragend)="onDragEnd()"
                 class="absolute top-2 left-2 cursor-grab active:cursor-grabbing flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary/10 dark:hover:bg-primary-dark/10 transition-all text-gray-400 hover:text-primary dark:hover:text-primary-dark opacity-0 group-hover:opacity-100"
                 title="Drag to move to folder">
              <span class="text-xl">⋮⋮</span>
            </div>
            <div class="flex-1 pt-6">
              <h3 class="text-2xl font-bold transition-colors mb-2 text-transparent bg-clip-text bg-gradient-to-r from-light-headline to-primary dark:from-dark-headline dark:to-primary-dark">
                {{ item.word.text }}
              </h3>
              <p class="text-base mb-3 font-semibold transition-colors text-primary dark:text-primary-dark">
                {{ item.word.reading }}
              </p>
              <p class="mb-3 transition-colors text-light-paragraph dark:text-dark-paragraph">
                {{ item.word.meaning }}
              </p>
              <p *ngIf="!isFromBook(item.exampleSentence)"
                 class="text-sm mb-4 italic opacity-75 transition-colors text-light-paragraph dark:text-dark-paragraph bg-light-bg dark:bg-slate-700 p-3 rounded-lg">
                {{ item.exampleSentence }}
              </p>
              <p *ngIf="isFromBook(item.exampleSentence)"
                 class="text-sm mb-4 bg-gradient-to-r from-primary/10 to-primary-dark/10 dark:from-primary-dark/10 dark:to-primary/10 p-3 rounded-lg">
                <span class="inline-block">📖</span> <span class="text-light-paragraph dark:text-dark-paragraph opacity-75">From: </span>
                <button (click)="navigateToBook(item.exampleSentence)"
                        class="font-bold underline transition-colors cursor-pointer text-primary dark:text-primary-dark hover:opacity-70 block mt-1">
                  {{ getBookInfo(item.exampleSentence)?.bookTitle }}
                </button>
              </p>
            </div>
            <div class="flex flex-col gap-2 pt-3 border-t-2 border-primary/10 dark:border-primary-dark/10">
              <span [ngClass]="getWordStatus(item) === 'reviewed'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white'
                      : getWordStatus(item) === 'toBeReviewed'
                      ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'"
                    class="inline-block px-3 py-1.5 rounded-lg text-xs font-semibold text-center shadow-md transition-all hover:scale-105">
                <span class="inline-block" *ngIf="getWordStatus(item) === 'reviewed'">✓</span>
                <span class="inline-block" *ngIf="getWordStatus(item) === 'toBeReviewed'">🔔</span>
                <span class="inline-block" *ngIf="getWordStatus(item) === 'new'">⭐</span>
                {{ getWordStatus(item) === 'reviewed' ? 'Reviewed' : getWordStatus(item) === 'toBeReviewed' ? 'To Review' : 'New' }}
              </span>
              <div class="grid grid-cols-2 gap-2">
                <button (click)="scheduleForReview(item.id)"
                  class="px-2 py-1.5 rounded-lg transition-all duration-300 font-semibold text-xs bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-md hover:shadow-lg hover:scale-105"
                        title="Review this word now">
                  <span class="inline-block">⚡</span>
                </button>
                <button (click)="confirmDelete(item.id)"
                        class="px-2 py-1.5 rounded-lg transition-all duration-300 font-semibold text-xs bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md hover:shadow-lg hover:scale-105">
                  <span class="inline-block">🗑️</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="filteredVocabulary.length === 0" class="text-center py-16" @fadeIn>
          <div class="text-6xl mb-4 inline-block">📚</div>
          <p class="text-xl font-bold mb-2 text-light-headline dark:text-dark-headline">
            {{ searchTerm ? 'No matches found' : 'No vocabulary yet' }}
          </p>
          <p class="text-sm opacity-75 text-light-paragraph dark:text-dark-paragraph">
            {{ searchTerm ? 'Try a different search term' : 'Start adding words to build your collection!' }}
          </p>
        </div>

        <!-- Delete Confirmation Modal -->
        <div *ngIf="showDeleteConfirm" @fadeIn
             class="fixed inset-0 flex items-center justify-center z-50 transition-all backdrop-blur-sm bg-black/40 dark:bg-black/60 p-4">
          <div @scaleIn class="rounded-xl shadow-xl p-6 max-w-md w-full border-2 border-red-500/30 bg-white dark:bg-slate-800 transition-colors">
            <div class="text-center mb-4">
              <div class="text-5xl mb-3 inline-block">🗑️</div>
              <h2 class="text-2xl font-bold mb-2">
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">Delete Word?</span>
              </h2>
              <p class="text-base transition-colors text-light-paragraph dark:text-dark-paragraph">
                Are you sure you want to delete
              </p>
              <p class="text-xl font-bold mt-2 text-primary dark:text-primary-dark">
                "{{ getWordToDelete()?.word?.text }}"
              </p>
              <p class="text-xs mt-2 opacity-75 transition-colors text-light-paragraph dark:text-dark-paragraph">
                This action cannot be undone.
              </p>
            </div>
            <div class="flex gap-3">
              <button (click)="deleteWord()"
                      class="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105">
                Delete
              </button>
              <button (click)="cancelDelete()"
                      class="flex-1 bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold hover:shadow-lg hover:scale-105">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Delete Folder Confirmation Modal -->
        <div *ngIf="showDeleteFolderConfirm" @fadeIn
             class="fixed inset-0 flex items-center justify-center z-50 transition-all backdrop-blur-sm bg-black/40 dark:bg-black/60 p-4">
          <div @scaleIn class="rounded-xl shadow-xl p-6 max-w-md w-full border-2 border-red-500/30 bg-white dark:bg-slate-800 transition-colors">
            <div class="text-center mb-4">
              <div class="text-5xl mb-3 inline-block">📁</div>
              <h2 class="text-2xl font-bold mb-2">
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">Delete Folder?</span>
              </h2>
              <p class="text-base transition-colors text-light-paragraph dark:text-dark-paragraph">
                Are you sure you want to delete
              </p>
              <p class="text-xl font-bold mt-2 text-primary dark:text-primary-dark">
                "{{ getFolderToDelete()?.name }}"
              </p>
              <p class="text-xs mt-2 opacity-75 transition-colors text-light-paragraph dark:text-dark-paragraph">
                Words in this folder will be moved to "No Folder". This action cannot be undone.
              </p>
            </div>
            <div class="flex gap-3">
              <button (click)="deleteFolder()"
                      class="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105">
                Delete
              </button>
              <button (click)="cancelDeleteFolder()"
                      class="flex-1 bg-light-bg dark:bg-slate-700 text-light-headline dark:text-dark-headline px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold hover:shadow-lg hover:scale-105">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class VocabularyListComponent implements OnInit {
  vocabulary: VocabularyItem[] = [];
  folders: VocabularyFolder[] = [];
  selectedFolderId: string | null = null;
  filter: 'all' | 'new' | 'toBeReviewed' | 'reviewed' = 'all';
  viewMode: 'list' | 'card' = 'list';
  searchTerm: string = '';
  customWordText: string = '';
  customWordReading: string = '';
  customWordMeaning: string = '';
  customPartOfSpeech: string = '';
  customExampleSentence: string = '';
  customWordAddedMessage: string = '';
  customWordErrorMessage: string = '';
  showAddWordForm: boolean = false;
  currentTheme: Theme = 'light';
  showDeleteConfirm: boolean = false;
  deleteConfirmId: string | null = null;
  showDeleteFolderConfirm: boolean = false;
  deleteFolderConfirmId: string | null = null;
  books: any[] = [];
  showCreateFolderForm = false;
  newFolderName = '';
  newFolderColor = '#D14A5A';
  draggedWordId: string | null = null;
  dragOverFolderId: string | null = null;

  predefinedColors = [
    '#D14A5A', // lantern red
    '#ef4444', // red
    '#f59e0b', // orange
    '#10b981', // green
    '#3b82f6', // blue
    '#ec4899', // pink
    '#eab308', // yellow
    '#C97A8B', // night sakura
    '#f97316', // deep orange
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#6366f1', // indigo
    '#0ea5e9', // sky-deep
    '#06b6d4', // cyan-bright
    '#22c55e', // emerald
    '#2dd4bf', // teal-light
    '#fb923c', // orange-light
    '#38bdf8', // sky
    '#f43f5e', // rose
    '#94a3b8', // slate
  ];

  get newCount(): number {
    return this.vocabulary.filter(v => !v.reviewed).length;
  }

  get toBeReviewedCount(): number {
    return this.vocabulary.filter(v => this.isWordDueForReview(v)).length;
  }

  get reviewedCount(): number {
    return this.vocabulary.filter(v => v.reviewed && !this.isWordDueForReview(v)).length;
  }

  getWordStatus(item: VocabularyItem): 'new' | 'toBeReviewed' | 'reviewed' {
    if (!item.reviewed) {
      return 'new';
    }
    if (this.isWordDueForReview(item)) {
      return 'toBeReviewed';
    }
    return 'reviewed';
  }

  private isWordDueForReview(item: VocabularyItem): boolean {
    const flashcard = this.srsService.getFlashcard(item.id);
    if (!flashcard) return false;
    return new Date() >= flashcard.nextReview;
  }

  get filteredVocabulary(): VocabularyItem[] {
    let result = this.vocabulary;

    // Apply folder filter
    if (this.selectedFolderId !== null) {
      result = result.filter(v => v.folderId === this.selectedFolderId);
    }

    // Apply status filter
    if (this.filter === 'new') {
      result = result.filter(v => !v.reviewed);
    } else if (this.filter === 'toBeReviewed') {
      result = result.filter(v => this.isWordDueForReview(v));
    } else if (this.filter === 'reviewed') {
      result = result.filter(v => v.reviewed && !this.isWordDueForReview(v));
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(v => 
        v.word.text.toLowerCase().includes(term) ||
        v.word.reading.toLowerCase().includes(term) ||
        v.word.meaning.toLowerCase().includes(term) ||
        v.exampleSentence.toLowerCase().includes(term)
      );
    }

    return result;
  }

  constructor(
    private vocabularyService: VocabularyService,
    private srsService: SrsService,
    private bookService: BookService,
    private folderService: FolderService,
    private router: Router,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    this.vocabularyService.vocabulary$.subscribe(vocab => {
      this.vocabulary = vocab;
    });

    this.folderService.folders$.subscribe(folders => {
      this.folders = folders;
    });

    this.folderService.refreshFolders();

    this.bookService.getBooks().subscribe(books => {
      this.books = books;
    });
  }

  confirmDelete(vocabularyId: string): void {
    this.deleteConfirmId = vocabularyId;
    this.showDeleteConfirm = true;
  }

  deleteWord(): void {
    if (this.deleteConfirmId) {
      this.vocabularyService.deleteWord(this.deleteConfirmId);
      this.showDeleteConfirm = false;
      this.deleteConfirmId = null;
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteConfirmId = null;
  }

  scheduleForReview(vocabularyId: string): void {
    this.vocabularyService.scheduleForImmediateReview(vocabularyId);
    this.srsService.scheduleFlashcardForImmediateReview(vocabularyId);
  }

  getWordToDelete(): VocabularyItem | undefined {
    if (!this.deleteConfirmId) return undefined;
    return this.vocabulary.find(v => v.id === this.deleteConfirmId);
  }

  isFromBook(exampleSentence: string): boolean {
    return exampleSentence.startsWith('From:');
  }

  getBookInfo(exampleSentence: string): { bookTitle: string; chapterTitle: string } | null {
    if (!this.isFromBook(exampleSentence)) return null;
    const parts = exampleSentence.replace('From: ', '').split(' - ');
    if (parts.length === 2) {
      return { bookTitle: parts[0].trim(), chapterTitle: parts[1].trim() };
    }
    return null;
  }

  navigateToBook(exampleSentence: string): void {
    const bookInfo = this.getBookInfo(exampleSentence);
    if (!bookInfo) return;

    const book = this.books.find(b => b.title === bookInfo.bookTitle);
    if (book) {
      const chapters = this.bookService.getChapters(book.id);
      const chapter = chapters.find(c => c.title === bookInfo.chapterTitle);
      if (chapter) {
        this.router.navigate(['/books', book.id, chapter.id]);
      }
    }
  }

  toggleAddWordForm(): void {
    this.showAddWordForm = !this.showAddWordForm;
  }

  addCustomWord(): void {
    const text = this.customWordText.trim();
    const meaning = this.customWordMeaning.trim();

    if (!text || !meaning) {
      return;
    }

    // Clear previous messages
    this.customWordAddedMessage = '';
    this.customWordErrorMessage = '';

    const word: Word = {
      id: `word-custom-${Date.now()}`,
      text,
      reading: this.customWordReading.trim() || text,
      meaning,
      partOfSpeech: this.customPartOfSpeech.trim() || 'custom'
    };

    const exampleSentence = this.customExampleSentence.trim() || `Added manually: ${text}`;
    
    this.vocabularyService.addWord(word, exampleSentence).subscribe({
      next: () => {
        this.customWordText = '';
        this.customWordReading = '';
        this.customWordMeaning = '';
        this.customPartOfSpeech = '';
        this.customExampleSentence = '';
        this.customWordAddedMessage = `Added "${word.text}" to your vocabulary`;
        this.showAddWordForm = false;

        setTimeout(() => {
          this.customWordAddedMessage = '';
        }, 2500);
      },
      error: (err: any) => {
        if (err.error) {
          this.customWordErrorMessage = err.error;
        } else {
          this.customWordErrorMessage = 'Failed to add word. Please try again.';
        }

        setTimeout(() => {
          this.customWordErrorMessage = '';
        }, 5000);
      }
    });
  }

  selectFolder(folderId: string | null): void {
    this.selectedFolderId = folderId;
  }

  toggleCreateFolderForm(): void {
    this.showCreateFolderForm = !this.showCreateFolderForm;
  }

  createFolder(): void {
    if (!this.newFolderName.trim()) return;

    this.folderService.createFolder(this.newFolderName, this.newFolderColor).subscribe({
      next: () => {
        this.folderService.refreshFolders();
        this.newFolderName = '';
        this.newFolderColor = '#D14A5A';
        this.showCreateFolderForm = false;
      },
      error: (err) => {
        console.error('Failed to create folder:', err);
      }
    });
  }

  confirmDeleteFolder(folderId: string): void {
    this.deleteFolderConfirmId = folderId;
    this.showDeleteFolderConfirm = true;
  }

  deleteFolder(): void {
    if (!this.deleteFolderConfirmId) return;

    this.folderService.deleteFolder(this.deleteFolderConfirmId).subscribe({
      next: () => {
        this.folderService.refreshFolders();
        this.vocabularyService.refreshVocabularyFromApi();
        if (this.selectedFolderId === this.deleteFolderConfirmId) {
          this.selectedFolderId = null;
        }
        this.showDeleteFolderConfirm = false;
        this.deleteFolderConfirmId = null;
      },
      error: (err) => {
        console.error('Failed to delete folder:', err);
        this.showDeleteFolderConfirm = false;
        this.deleteFolderConfirmId = null;
      }
    });
  }

  cancelDeleteFolder(): void {
    this.showDeleteFolderConfirm = false;
    this.deleteFolderConfirmId = null;
  }

  getFolderToDelete(): VocabularyFolder | undefined {
    return this.folders.find(f => f.id === this.deleteFolderConfirmId);
  }

  getFolderName(folderId: string | undefined): string {
    if (!folderId) return 'No Folder';
    const folder = this.folders.find(f => f.id === folderId);
    return folder ? folder.name : 'Unknown';
  }

  getFolderWordsCount(folderId: string | null): number {
    if (folderId === null) {
      // "All Words" should count all vocabulary regardless of folder
      return this.vocabulary.length;
    }
    return this.vocabulary.filter(v => v.folderId === folderId).length;
  }

  // Drag and drop methods
  onDragStart(wordId: string, event: DragEvent): void {
    this.draggedWordId = wordId;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', wordId);
      
      // Set the entire word item as the drag image
      const dragHandle = event.target as HTMLElement;
      const wordItem = dragHandle.closest('.rounded-lg') as HTMLElement;
      if (wordItem) {
        // Clone the element to use as drag image
        const dragImage = wordItem.cloneNode(true) as HTMLElement;
        dragImage.style.position = 'absolute';
        dragImage.style.left = '-9999px';
        dragImage.style.width = wordItem.offsetWidth + 'px';
        document.body.appendChild(dragImage);
        
        event.dataTransfer.setDragImage(dragImage, event.offsetX, event.offsetY);
        
        // Clean up the clone after drag starts
        setTimeout(() => {
          document.body.removeChild(dragImage);
        }, 0);
      }
    }
  }

  onDragEnd(): void {
    this.draggedWordId = null;
    this.dragOverFolderId = null;
  }

  onDragOver(event: DragEvent, folderId: string | null): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverFolderId = folderId;
  }

  onDragLeave(): void {
    this.dragOverFolderId = null;
  }

  onDrop(event: DragEvent, folderId: string | null): void {
    event.preventDefault();
    
    if (this.draggedWordId) {
      this.folderService.moveToFolder(this.draggedWordId, folderId).subscribe({
        next: () => {
          this.vocabularyService.refreshVocabularyFromApi();
          this.folderService.refreshFolders();
          this.draggedWordId = null;
          this.dragOverFolderId = null;
        },
        error: (err) => {
          console.error('Failed to move word:', err);
          this.draggedWordId = null;
          this.dragOverFolderId = null;
        }
      });
    }
  }
}
