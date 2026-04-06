import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Banner } from '../models/banners.model';

@Injectable({ providedIn: 'root' })
export class BannerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/banners';

  getBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(this.apiUrl);
  }

  getBannerById(id: string): Observable<Banner> {
    console.log('Edit bannner');
    return this.http.get<Banner>(`${this.apiUrl}/${id}`);
  }

  createBanner(data: Banner): Observable<Banner> {
    return this.http.post<Banner>(this.apiUrl, data);
  }

  updateBanner(id: string, data: Banner): Observable<Banner> {
    return this.http.put<Banner>(`${this.apiUrl}/${id}`, data);
  }

  deleteBanner(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
