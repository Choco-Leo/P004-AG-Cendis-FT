import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashbord.html',
  styleUrl: './dashbord.css'
})
export class Dashbord implements OnInit {
  userName: string = '';
  today: Date = new Date();

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userName = user.login_cendi;
      }
    });
  }
}
