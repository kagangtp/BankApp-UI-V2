import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // İki yönlü veri bağlama için şart

@Component({
  selector: 'app-u-text-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './u-text-box.html',
  styleUrls: ['./u-text-box.css']
})
export class UTextBoxComponent {
  @Input() caption: string = '';
  @Input() text: string = '';
  
  // ERROR TS2339 (type) için:
  @Input() type: string = 'text'; 
  
  // ERROR TS2339 (placeholder) için:
  @Input() placeholder: string = ''; 

  @Output() textChange = new EventEmitter<string>();
  onValueChange(newValue: string) {
    this.textChange.emit(newValue);
  }
}