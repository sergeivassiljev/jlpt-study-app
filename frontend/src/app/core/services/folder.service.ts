import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { VocabularyFolder } from '../models/index';

@Injectable({
  providedIn: 'root'
})
export class FolderService {
  private readonly apiBaseUrl = 'http://localhost:3000';
  private foldersSubject = new BehaviorSubject<VocabularyFolder[]>([]);
  folders$ = this.foldersSubject.asObservable();
  private folders: VocabularyFolder[] = [];

  constructor(private http: HttpClient) {}

  getFolders(): Observable<VocabularyFolder[]> {
    return this.folders$;
  }

  refreshFolders(): void {
    this.http.get<VocabularyFolder[]>(`${this.apiBaseUrl}/vocabulary/folders`).subscribe({
      next: (folders) => {
        this.folders = folders.map(f => ({
          ...f,
          createdAt: new Date(f.createdAt)
        }));
        this.foldersSubject.next([...this.folders]);
      },
      error: () => {
        this.foldersSubject.next([...this.folders]);
      }
    });
  }

  createFolder(name: string, color: string = ''): Observable<VocabularyFolder> {
    return this.http.post<VocabularyFolder>(
      `${this.apiBaseUrl}/vocabulary/folders`,
      { name, color }
    );
  }

  deleteFolder(folderId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiBaseUrl}/vocabulary/folders/${folderId}`
    );
  }

  moveToFolder(vocabularyId: string, folderId: string | null): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(
      `${this.apiBaseUrl}/vocabulary/${vocabularyId}/move-to-folder`,
      { folderId }
    );
  }

  getVocabularyByFolder(folderId: string | null): Observable<any[]> {
    const id = folderId === null ? 'none' : folderId;
    return this.http.get<any[]>(
      `${this.apiBaseUrl}/vocabulary/folders/${id}`
    );
  }
}
