import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DropDownList } from '../../model/dropdownlist/DropDownList';

@Injectable({
  providedIn: 'root'
})
export class ProjectTypeService {
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
  constructor(private http: HttpClient) { }

  getDropdownlist(): Observable<DropDownList[]> {
    return this.http.get<any>('/ProjectType/getdropdownlist');
  }
  
}
