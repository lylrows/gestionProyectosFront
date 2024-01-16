import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MasterTable } from 'src/app/layout/manage/model/common/mastertable';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MastertableService {
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
  constructor(private http: HttpClient) { }
  getmastertable(nid_father): Observable<any> {
    return this.http.get<any>('/common/getmastertable?nid_father='+ nid_father,this.httpOptions);
  }

  getjobs(): Observable<any> {
    return this.http.get<any>('/common/getjobs',this.httpOptions);
  }


  editmastertable(masterTable: MasterTable): Observable<any> {
    return this.http.post<any>('/common/editmastertable', masterTable);
  }
}
