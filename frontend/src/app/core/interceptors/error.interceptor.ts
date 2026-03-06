import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Silently handle specific backend errors when backend is unavailable
        if (error.status === 404 || error.status === 0) {
          // Return error but suppress console logging for expected failures
          console.info('Backend unavailable - using localStorage fallback');
          return throwError(() => error);
        }
        
        // For other errors, log them
        console.error('HTTP Error:', error);
        return throwError(() => error);
      })
    );
  }
}
