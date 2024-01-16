import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from 'src/app/layout/manage/model/user/user';
import { Observable } from 'rxjs';
import { Permiso } from '../../model/common/permiso';

@Injectable({
  providedIn: 'root'
})
export class PermisoService {
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
  constructor(private http: HttpClient) { }

  getpermission(nid_profile, nid_resource): Observable<any> {
    return this.http.get<any>('/common/getpermission?nid_profile='+ nid_profile + '&&nid_resource='+ nid_resource ,this.httpOptions);
  }

  getpermissionbyuser(nid_resource): Observable<any> {
    return this.http.get<any>('/common/getpermissionbyuser?nid_resource='+ nid_resource ,this.httpOptions);
  }

  editpermission(permiso: Permiso): Observable<any> {
    return this.http.put<any>('/common/editpermiso', permiso);
  }

  inspermission(nidprofile: number, nuser: number, perfilAcopiar: number): Observable<any> {
    return this.http.get<any>('/common/inspermission?nid_profile='+ nidprofile + '&&nuser='+ nuser + '&&perfilAcopiar='+ perfilAcopiar,this.httpOptions);
  }

}
