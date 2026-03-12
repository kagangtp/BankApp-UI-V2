import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // NgIf, NgClass vb. için
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/authService';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-registrationpage',
  standalone: true, // Standalone olduğunu belirtiyoruz
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule], // Gerekli modüller burada
  templateUrl: './registrationpage.html',
  styleUrls: ['./registrationpage.css']
})
export class RegistrationPage implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          console.log('Kayıt başarılı', res);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Kayıt hatası', err);
        }
      });
    }
  }
}