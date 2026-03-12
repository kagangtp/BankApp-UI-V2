import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';



@Component({
  selector: 'app-mainpage',
  imports: [Navbar, Sidebar, RouterOutlet], 
  templateUrl: './mainpage.html',
  styleUrl: './mainpage.css',
})
export class Mainpage {

}
