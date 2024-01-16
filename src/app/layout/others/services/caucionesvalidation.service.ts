import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CaucionesvalidationService {
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
  constructor(private http: HttpClient) { }

  getInfoPolicyCauciones(parameters): Observable<Object[]> {  
    return this.http.post<Object[]>('/caucionesvalidation/getinfopolicy', parameters);
  }
}
