import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserParams } from 'src/app/layout/manage/model/user/user-params';
import { Login } from 'src/app/layout/manage/model/login/login';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient) { }

  verificarGuard() {
    return sessionStorage.getItem('Guard') !== null ? true : false;
  }

  logIn(userParams: UserParams): Observable<Login> {
    return this.http.post<Login>('/login/authenticate', userParams);
  }

  logOut(intUser: number): Observable<any> {
    return this.http.post<any>('/login/logout', intUser);
  }
}
