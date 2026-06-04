import { Component, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Banner } from '../../models/banners.model';
import { BannerService } from '../../services/banner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-banner-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    RouterLink,
    MatSnackBarModule,
    MatPaginator,
  ],
  templateUrl: './banner-list.html',
  styleUrl: './banner-list.scss',
})
export class BannerList implements OnInit {
  public banners: Banner[] = [];
  public isLoading = signal<boolean>(true);

  public totalItems = 0;
  public pageSize = 3;
  public currentPage = 0;

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

    this.bannerService.getBanners(this.currentPage + 1, this.pageSize).subscribe({
      next: (res: any) => {
        console.log(`Получено баннеров: ${res.banners?.length} из общего числа ${res.totalItems}`);

        this.banners = res.banners || [];
        this.totalItems = res.totalItems || 0;

        this.cdr.detectChanges();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Ошибка загрузки баннеров:', err);
        this.banners = [];
        this.totalItems = 0;
        this.isLoading.set(false);
        this.showError('Не удалось загрузить список баннеров. Проверьте подключение к серверу.');
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    this.loadBanners();
  }

  onDelete(id: string | undefined): void {
    if (!id) {
      console.warn('ID банера не найден');
      return;
    }

    if (confirm('Вы уверены, что хотите удалить этот банер?')) {
      this.bannerService.deleteBanner(id).subscribe({
        next: () => {
          console.log('Банер успешно удален из базы');

          this.snackBar.open('Баннер успешно удален!', 'ОК', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });

          this.totalItems--;

          const maxPages = Math.ceil(this.totalItems / this.pageSize);

          if (this.currentPage >= maxPages && this.currentPage > 0) {
            this.currentPage--;
          }

          this.loadBanners();
        },
        error: (err) => {
          console.error('Ошибка при удалении баннера:', err);
          this.showError('Не удалось удалить баннер. Ошибка на стороне сервера.');
        },
      });
    }
  }
}
