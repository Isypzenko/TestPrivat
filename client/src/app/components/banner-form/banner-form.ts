import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { BannerService } from '../../services/banner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-banner-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './banner-form.html',
  styleUrl: './banner-form.scss',
})
export class BannerForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bannerService = inject(BannerService);

  public bannerForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    src: ['', [Validators.required]],
  });

  public imagePreview = signal<string | null>(null);
  public isEditMode = false;
  private bannerId: string | null = null;

  ngOnInit(): void {
    this.bannerId = this.route.snapshot.paramMap.get('id');
    if (this.bannerId) {
      this.isEditMode = true;
      this.loadBannerForEdit(this.bannerId);
    }
  }

  private loadBannerForEdit(id: string): void {
    this.bannerService.getBannerById(id).subscribe((banner) => {
      this.bannerForm.patchValue({
        title: banner.title,
        src: banner.src,
      });
      this.imagePreview.set(banner.src);
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        this.imagePreview.set(base64String);
        this.bannerForm.patchValue({
          src: base64String,
        });

        this.bannerForm.get('src')?.updateValueAndValidity();
      };

      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview.set(null);
    this.bannerForm.patchValue({ src: '' });
  }

  submit(): void {
    if (this.bannerForm.valid) {
      const bannerData = this.bannerForm.value;

      if (this.isEditMode && this.bannerId) {
        this.bannerService.updateBanner(this.bannerId, bannerData).subscribe({
          next: () => {
            console.log('Банер обновлен');
            this.router.navigate(['/']);
          },
          error: (err) => console.error('Ошибка обновления:', err),
        });
      } else {
        this.bannerService.createBanner(bannerData).subscribe({
          next: () => {
            console.log('Банер создан');
            this.router.navigate(['/']);
          },
          error: (err) => console.error('Ошибка создания:', err),
        });
      }
    }
  }
}
