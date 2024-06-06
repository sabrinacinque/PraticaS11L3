import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { iUser } from '../../Models/i-user';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router'; // Importa Router

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'] // Usa styleUrls invece di styleUrl
})
export class RegisterComponent {

  newUser: Partial<iUser> = {}

  @ViewChild('registerForm') registerForm: NgForm | null = null;

  constructor(private authSvc: AuthService, private router: Router) {} // Inietta Router

  register() {
    if (this.registerForm && this.registerForm.valid) {
      this.authSvc.register(this.newUser).subscribe(() => {
        alert("Registrazione avvenuta con successo");

        if (this.registerForm) {
          this.registerForm.resetForm(); // Pulisce il form
        }

        this.router.navigate(['']); // Reindirizza alla home
      });
    } else {
      alert("Compila tutti i campi correttamente.");
    }
  }

}
