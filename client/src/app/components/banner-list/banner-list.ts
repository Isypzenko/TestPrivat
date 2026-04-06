import { Component, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { Banner } from '../../models/banners.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { BannerService } from '../../services/banner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banner-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, RouterLink],
  templateUrl: './banner-list.html',
  styleUrl: './banner-list.scss',
})
export class BannerList implements OnInit {
  public banners: Banner[] = [];
  public isLoading = signal<boolean>(true);
  private cdr = inject(ChangeDetectorRef);

  private bannerService = inject(BannerService);

  ngOnInit(): void {
    this.loadBanners();
  }

  loadBanners() {
    this.isLoading.set(true);
    this.bannerService.getBanners().subscribe({
      next: (data) => {
        console.log('Получено банеров из БД:', data.length);
        this.banners = data;
        this.cdr.detectChanges();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Ошибка загрузки:', err);
        this.banners = [];
        this.isLoading.set(false);
      },
    });
  }

  onDelete(id: string | undefined): void {
    if (!id) {
      console.warn('ID банера не найден');
      return;
    }

    if (confirm('Вы уверены, что хотите удалить этот банер?')) {
      this.bannerService.deleteBanner(id).subscribe({
        next: () => {
          this.banners = this.banners.filter((b) => b.id !== id);
          this.cdr.detectChanges();
          console.log('Банер успешно удален из базы и экрана');
        },
        error: (err) => console.error('Ошибка при удалении:', err),
      });
    }
  }
}
