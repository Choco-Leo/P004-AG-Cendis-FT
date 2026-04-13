import { Component, HostListener } from '@angular/core';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [Header, Footer, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  standalone: true
})
export class MainLayout {
  showScrollButton = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    const scrollHeight = window.scrollY;
    this.showScrollButton = scrollHeight > 0;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
