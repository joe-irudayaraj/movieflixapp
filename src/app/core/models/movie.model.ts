export type Imdb = { rating?: number; votes?: number };

export interface Movie {
  id: string;
  title: string;
  year?: number;
  genres?: string[];
  poster?: string;
  imdb?: Imdb;
  runtime?: number;
  plot?: string;
  cast: string[];
}


export interface Page<T> { page: number; size: number; total: number; items: T[]; }


