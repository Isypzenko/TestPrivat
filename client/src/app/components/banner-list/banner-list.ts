import { Component, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Banner } from '../../models/banners.model';
import { BannerService } from '../../services/banner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-banner-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, RouterLink, MatSnackBarModule],
  templateUrl: './banner-list.html',
  styleUrl: './banner-list.scss',
})
export class BannerList implements OnInit {
  public banners: Banner[] = [];
  public isLoading = signal<boolean>(true);

  private cdr = inject(ChangeDetectorRef);
  private bannerService = inject(BannerService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadBanners();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  loadBanners(): void {
    this.isLoading.set(true);
    this.bannerService.getBanners().subscribe({
      next: (data) => {
        console.log('Получено банеров из БД:', data.length);
        this.banners = data;
        this.cdr.detectChanges();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Ошибка загрузки баннеров:', err);
        this.banners = [];
        this.isLoading.set(false);
        this.showError('Не удалось загрузить список баннеров. Проверьте подключение к серверу.');
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

          this.snackBar.open('Баннер успешно удален!', 'ОК', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
        error: (err) => {
          console.error('Ошибка при удалении баннера:', err);
          this.showError('Не удалось удалить баннер. Ошибка на стороне сервера.');
        },
      });
    }
  }
}
