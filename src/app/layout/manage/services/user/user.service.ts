import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/layout/manage/model/user/user';
import { Observable } from 'rxjs';
import { Result } from 'src/app/layout/manage/shared/models/result';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }
  listarPerfiles(): Observable<any> {
    return this.http.get<any>('/User/getprofile');
  }
  canalVenta(): Observable<any> {
    return this.http.get<any>('/User/getchannel');
  }
  existsuserbysdoc(user: User): Observable<Result> {    
    return this.http.post<Result>('/User/existsuserbysdoc', user);
  }
  existsuserbysUser(mensaje: any): Observable<any> {  ///////
    console.log(mensaje, "prueba");
    return this.http.post<any>('/User/existsuserbysuser', mensaje);
  }
  existsuserbyDoc(mensaje: any): Observable<any>{
    console.log(mensaje, "pruebaDocRepetido");
    return this.http.post<any>('/User/existsuserbydoc', mensaje);
  }
  existsuser(user: User): Observable<Result> {    
    console.log("El usuario que se envia al service", user);
    return this.http.post<Result>('/User/existsuser', user);
  }
  listaUsuarios(user: User): Observable<User[]> {
    return this.http.post<User[]>('/User/insupuser', user);
  }
  listaUsuariosPaginado(parameter: any): Observable<any> {
    return this.http.post<any>('/User/getlistuserpagination', parameter);
  }
  guardarUser(user: User, action: string): Observable<Result> {    
    if (action == "Add")
      return this.http.post<Result>('/User/insupuser/', user);
    else
      return this.http.post<Result>('/User/updateuser/', user);
  }
  validate(user: User): Observable<number> {
    return this.http.post<number>('/StepsClientsService/Validate', user);
  }

}