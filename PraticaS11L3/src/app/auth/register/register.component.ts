import { Component } from '@angular/core';
import { iUser } from '../../Models/i-user';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  newUser:Partial<iUser> = {}

  constructor(private authSvc:AuthService){}

  register(){
    this.authSvc.register(this.newUser).subscribe(()=>{
      //avviso o redireziono l'utente
    })
  }

}
