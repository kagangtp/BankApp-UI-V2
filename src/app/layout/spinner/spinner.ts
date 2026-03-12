import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loadingService';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css'
})
export class SpinnerComponent {
  loadingService = inject(LoadingService);
}