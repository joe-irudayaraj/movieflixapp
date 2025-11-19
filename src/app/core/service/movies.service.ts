import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Movie, Page} from '../models/movie.model';

@Injectable({providedIn: 'root'})
export class MoviesService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8080/movieflix-api/api/movies';


  page(page: number, size: number): Observable<Page<Movie>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', 'imdb.rating')
      .set('dir', 'desc');
    return this.http.get<Page<Movie>>(this.base, {params});
  }

  /** Only endpoint used: GET /api/movies/top?limit=n */
  top(limit = 8): Observable<Movie[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<Movie[]>(`${this.base}/top`, {params});
  }

  // NEW: fetch one movie (expects your Spring endpoint: GET /api/movies/{id})
  byId(id: string): Observable<Movie> {
    console.log("Calling>>>>>>>>")
    return this.http.get<Movie>(`${this.base}/${id}`);
  }

  posterSrc(raw?: string) {
    // if you have a Spring poster proxy: return raw ? `${this.base}/poster?url=${encodeURIComponent(raw)}` : 'assets/poster-fallback.jpg';
    return raw ?? 'assets/poster-fallback.jpg';
  }
}
