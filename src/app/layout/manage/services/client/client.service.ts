import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { Client } from '../../model/client/client';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
  constructor(private http: HttpClient) { }

  getDropdownlist(op: number): Observable<Client[]> {
    return this.http.get<any>('/Client/getdropdownlist?op='+ op, this.httpOptions);
  }

  insupclient(client): Observable<any> {
    return this.http.post<any>('/Client/insupclient', client);
  }
  
}
