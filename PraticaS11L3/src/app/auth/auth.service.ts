import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { iUser } from '../Models/i-user';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { iAuthData } from '../Models/i-auth-data';
import { iAuthResponse } from '../Models/i-auth-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  jwtHelper:JwtHelperService = new JwtHelperService()//ci permette di lavorare facilmente con i jwt

  authSubject = new BehaviorSubject<null|iUser>(null);//se nel behaviorsubject c'è null significa che l'utente non è loggato, altrimenti conterrà l'oggetto user con tutte le sue info

  syncIsLoggedIn:boolean = false;//Utilizziamo questa variabile all'interno dell'interceptor e delle guard per poter sapere se l'utente è loggato o meno.

  user$ = this.authSubject.asObservable()//contiene i dati dell'utente loggato oppure null

  isLoggedIn$ = this.user$.pipe(
    map(user => !!user),
    tap(user => this.syncIsLoggedIn = user)
  )//restituisce true se l'utente è loggato, false se non lo è
  //!!user è come scrivere Boolean(user)
  //isLoggedIn$ = this.user$.pipe(map(user => Boolean(user)))

  constructor(
    private http:HttpClient,//per le chiamate http
    private router:Router//per i redirect
  ) {

    this.restoreUser()//come prima cosa controllo se è già attiva una sessione, e la ripristino

  }

  loginUrl:string = 'http://localhost:3000/login'
  registerUrl:string = 'http://localhost:3000/register'

  //Metodo che effettua la chiamata per la registrazione. Invieremo un utente parziale poiché è il backend a definire l'id dello user.
  register(newUser:Partial<iUser>):Observable<iAuthResponse>{
    return this.http.post<iAuthResponse>(this.registerUrl,newUser)
    //È necessario indicare che questa chiamata restituirà un oggetto di tipo iAuthResponse, altrimenti i componenti non potranno gestire correttamente le risposte
  }


  //Metodo che effettua la chiamata al backend per effettuare un login e se questo va a buon fine, salva i dati in localStorage e li comunica al subject
  login(authData:iAuthData):Observable<iAuthResponse>{
    return this.http.post<iAuthResponse>(this.loginUrl, authData)
    .pipe(tap(data=>{//Tap esegue un'operazione generica ogni volta che i dati transitano all'interno di pipe

      this.authSubject.next(data.user)//Una volta che l'utente è loggato, comunicò i suoi dati al subject.
      localStorage.setItem('accessData',JSON.stringify(data))//A questo punto, salvo anche i dati all'interno del local storage In modo da poterli recuperare in altri momenti

      this.autoLogout()//Nel momento in cui l'utente è loggato devo già prevedere il momento in cui verrà estromesso a causa della scadenza della sessione

    }))
  }

  logout():void{
    //Se per fare il login comunicavamo al subject i dati dell'utente e salvavamo all'interno del local storage gli accessData in questa funzione faremo esattamente il contrario, quindi authSubject riceverà come dato null, mentre andremo ad effettuare il removeItem dei dati salvati nel local storage

    this.authSubject.next(null)//Invio un dato null al subject.
    localStorage.removeItem('accessData')//Rimuovo i dati dell'utente dal local storage.

    this.router.navigate(['/auth/login'])//Sposto l'utente alla pagina di login

  }

  //Metodo che calcola quanto tempo manca alla scadenza della sessione e avvia un timer che scateni il logout dell'utente quando questa scade
  autoLogout():void{

    const accessData = this.getAccessData()//Recupera i dati di accesso siccome in questa funzione devo utilizzare l'accessToken.

    if(!accessData) return//Se i dati di accesso non ci sono, significa che l'utente non è loggato, quindi blocca la funzione

    const expDate = this.jwtHelper.getTokenExpirationDate(accessData.accessToken) as Date//trovo la data di scadenza del token

    const expMs = expDate.getTime() - new Date().getTime()//Recupero Il numero di millisecondi contenuti nella data di scadenza del token e li sottraggo al numero di millisecondi relativi a data ed ora attuali. Cosi facendo ottengo il numero di millisecondi mancanti alla scadenza della sessione.

    setTimeout(this.logout,expMs)//Passato il numero di millisecondi restante avvia in automatico il logout.

  }

  //Metodo utilizzabile per ottenere i dati relativi alla attuale sessione, ad esempio tutti i dati relativi all'utente eccetto la password e l'accessToken legato all'attuale sessione
  getAccessData():iAuthResponse|null{

    const accessDataJson = localStorage.getItem('accessData')//recupero io dati di accesso
    if(!accessDataJson) return null //se l'utente non si è loggato i dati non ci sono, quindi blocca tutto

    const accessData:iAuthResponse = JSON.parse(accessDataJson)//se viene eseguita questa riga significa che i dati ci sono, quindi la converto da json ad oggetto per permetterne la manipolazione

    return accessData;
  }

  //Metodo utilizzato per recuperare i dati dell'utente e ripristinarli qualora venga effettuato il reload di pagina, in mancanza di questo metodo se ricarica la pagina, l'utente si troverebbe sloggato.
  restoreUser():void{

    const accessData = this.getAccessData()//Recupera i dati di accesso.

    if(!accessData) return//Se i dati di accesso non ci sono, significa che l'utente non è loggato, quindi blocca la funzione

    if(this.jwtHelper.isTokenExpired(accessData.accessToken)) return//ora controllo se il token è scaduto, se lo è fermiamo la funzione

    this.authSubject.next(accessData.user)//Se questa riga viene Letta, vuol dire che l'utente è loggato, quindi recupero i dati dell'utente e li comunico al subject per ripristinare il login
    this.autoLogout()//Avvio il timer per l'auto logout in modo che l'utente venga estromesso quando la sessione scade

  }

}
