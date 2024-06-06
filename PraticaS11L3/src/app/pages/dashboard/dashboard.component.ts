import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { iUser } from '../../Models/i-user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'] // Corretto styleUrl in styleUrls
})
export class DashboardComponent implements OnInit {

  user!: iUser;
  users: iUser[] = [];

  constructor(
    private authSvc: AuthService
  ) {}

  ngOnInit() {
    // Sottoscrizione all'utente autenticato
    this.authSvc.user$.subscribe(user => {
      if (user) {
        this.user = user;
        console.log('Authenticated user:', user);
      }
    });

    // Fetch di tutti gli utenti dal file JSON tramite AuthService
    this.authSvc.getUsers().subscribe(
      data => {
        console.log('Raw data from server:', data);
        this.users = data; // Assegna direttamente i dati ricevuti
        console.log('Fetched users:', this.users);
      },
      error => {
        console.error('Error fetching users:', error);
      }
    );
  }
}
