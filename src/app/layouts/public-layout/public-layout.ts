import { Component, HostListener } from '@angular/core';
import { HeaderPublic } from '../../shared/header-public/header-public';
import { Footer } from '../../shared/footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [Footer, HeaderPublic, RouterOutlet],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css'
})
export class PublicLayout {
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
