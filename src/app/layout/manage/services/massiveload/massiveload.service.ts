import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MassiveloadService {
  constructor(private http: HttpClient) { }

  uploadFiles(data: FormData): Observable<any> {
    return this.http.post<FormData>('/Massive/UploadFiles', data, {
        reportProgress: true,
        observe: 'events'
    });
  }

  getListMassive(parameters): Observable<Object[]> {
    return this.http.post<Object[]>('/Massive/getlistMassivePagination', parameters);
  }

}
