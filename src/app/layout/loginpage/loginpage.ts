import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/authService';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-loginpage',
  standalone: true,
  imports: [FormsModule, TranslateModule, RouterLink],
  templateUrl: './loginpage.html',
  styleUrl: './loginpage.css',
})
export class Loginpage {
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  loginData = { email: '', password: '' };

  // onLogin() {
  //   this.authService.login(this.loginData).subscribe({
  //     next: (response) => {
  //       // 1. DataResult başarılı mı kontrol et
  //       if (response.success) {
  //         // 2. Token artık 'data' alanının içinde
  //         const token = response.data;

  //         // 3. Servisindeki metodu kullanarak kaydet
  //         this.authService.saveToken(token);

  //         // NOT: Backend'den 'user' bilgisi dönüyorsan response.data içinden alabilirsin
  //         // Eğer token içinden parse edeceksen ilerde JWT Helper kullanabiliriz.

  //         // 4. Başarılıysa yönlendir
  //         this.router.navigate(['/mainpage/dashboard']);
  //       } else {
  //         // Backend success: false dönerse mesajı göster
  //         alert(response.message);
  //       }
  //     },
  //     error: (err) => {
  //       // Backend'den gelen hata mesajı (DataResult.Message)
  //       const errorMsg = err.error?.message || "Giriş başarısız!"; 
  //       alert(errorMsg); 
  //     }
  //   });
  // }

  rememberMe: boolean = false;

  onLogin() {
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        if (response.success) {
          // Artık response.data bir LoginResponse objesi (accessToken + expiresAt)
          this.authService.saveToken(response.data.accessToken, this.rememberMe);

          console.log(this.rememberMe ? "Kalıcı giriş yapıldı." : "Geçici giriş yapıldı.");
          this.router.navigate(['/mainpage/dashboard']);
        }
      },
      error: (err) => {
        const errorMsg = err.error?.message || this.translate.instant('TOAST.ERROR_GENERIC');
        this.toastr.error(errorMsg, this.translate.instant('TOAST.ERROR'));
      }
    });
  }
}