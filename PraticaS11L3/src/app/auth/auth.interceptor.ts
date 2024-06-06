import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  jwtHelper: JwtHelperService = new JwtHelperService();

  constructor(private authSvc: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const accessData = this.authSvc.getAccessData();
    console.log('Access Data:', accessData);

    if (!accessData || this.jwtHelper.isTokenExpired(accessData.accessToken)) {
      console.log('Token is invalid or expired');
      return next.handle(request);
    }

    const newReq = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${accessData.accessToken}`)
    });

    console.log('Request with Authorization Header:', newReq);

    return next.handle(newReq);
  }
}
