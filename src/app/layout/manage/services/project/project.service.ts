import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
  constructor(private http: HttpClient) { }
  getprojectpagination(parameters): Observable<Object[]> {
    return this.http.post<Object[]>('/project/getprojectpagination', parameters);
  }
  insert(project): Observable<any> {
    console.log("PROJECT",project)
    return this.http.post<any>('/project/insupproject', project);
  }
  getproject(scodproject): Observable<any> {
    return this.http.get<any>('/project/getproject?scodproject='+ scodproject,this.httpOptions);
  }
  getallproject(option): Observable<any> {
    return this.http.get<any>('/project/getallproject?option='+ option,this.httpOptions);
  }
  
  updateproject(scodproject: string, status: number): Observable<any>{
    return this.http.put<any>('/Project/' + scodproject + "/" + status,this.httpOptions);
  }
  insupprojectstep2(project): Observable<any> {
    return this.http.post<any>('/project/insupprojectstep2', project);
  }
  insupprojectstep2detail(project): Observable<any> {
    return this.http.post<any>('/project/insupprojectstep2detail', project);
  }
  getprojectdtep2detail(id): Observable<any> {
    return this.http.get<any>('/project/getprojectdtep2detail?id='+ id,this.httpOptions);
  }
  getprojectdtep2(scodproject): Observable<any> {
    return this.http.get<any>('/project/getprojectdtep2?scodproject='+ scodproject,this.httpOptions);
  }
  getprojectstep2history(id: number): Observable<any> {
    return this.http.get<any>('/project/getprojectstep2history?id='+ id,this.httpOptions);
  }
  insupprojectstep3(project): Observable<any> {
    return this.http.post<any>('/project/insupprojectstep3', project);
  }
  getprojectdtep3(scodproject): Observable<any> {
    return this.http.get<any>('/project/getprojectdtep3?scodproject='+ scodproject,this.httpOptions);
  }
  insupprojectstep4(project): Observable<any> {
    return this.http.post<any>('/project/insupprojectstep4', project);
  }
  getprojectdtep4(scodproject): Observable<any> {
    return this.http.get<any>('/project/getprojectdtep4?scodproject='+ scodproject,this.httpOptions);
  }
  insupprojectstep5(project): Observable<any> {
    return this.http.post<any>('/project/insupprojectstep5', project);
  }
  getprojectdtep5(scodproject): Observable<any> {
    return this.http.get<any>('/project/getprojectdtep5?scodproject='+ scodproject,this.httpOptions);
  }
  getprojectdtep4detail(project): Observable<any> {
    return this.http.get<any>('/project/getprojectdtep4detail?id='+ project,this.httpOptions);
  }
  getprojectinvoicing(scodproject): Observable<any> {
    return this.http.get<any>('/project/getprojectinvoicing?scodproject='+ scodproject,this.httpOptions);
  }
  insupprojectinvoicing(project): Observable<any> {
    return this.http.post<any>('/project/insupprojectinvoicing', project);
  }
  insupprojectingresoslist(year,month): Observable<any> {
    return this.http.get<any>('/project/getprojectingresos?year=' + year + "&&month=" + month,this.httpOptions);
  }

  getprojectestimate(scodproject, option): Observable<any> {
    // option 0 isAuxiliary false
    // option 1 isAuxiliary true
    // option 2 All
    return this.http.get<any>('/project/getprojectestimate?scodproject='+ scodproject + '&&option=' + option,this.httpOptions);
  }

  getpersonestimate(nid_project): Observable<any> {
    return this.http.get<any>('/project/getpersonestimate?nid_project='+ nid_project,this.httpOptions);
  }

  insupprojectestimate(project): Observable<any> {
    return this.http.post<any>('/project/insupprojectestimate', project);
  }
  getassignedprojectpagination(parameters): Observable<Object[]> {
    return this.http.post<Object[]>('/project/getassignedprojectpagination', parameters);
  }
  getprojecthourslogpagination(parameters): Observable<Object[]> {
    return this.http.post<Object[]>('/project/getprojecthourslogpagination', parameters);
  }

  getprojecthoursextpagination(parameters): Observable<Object[]> {
    return this.http.post<Object[]>('/project/getprojecthoursextpagination', parameters);
  }

  getprojecthourslog(scodproject): Observable<Object[]> {
    return this.http.get<Object[]>('/project/getprojecthourslog?scodproject='+ scodproject, this.httpOptions);
  }

  getreporthoursext(objeto): Observable<any>{
    return this.http.post<any>('/project/getreporthoursext', objeto);
  }

  getpersonprojecthoursext(nid_person,num_mes): Observable<Object[]> {
    return this.http.get<Object[]>('/project/getpersonprojecthoursext?nid_person='+ nid_person + '&&mes=' + num_mes, this.httpOptions);
  }

  getprojecthoursext(scodproject): Observable<Object[]> {
    return this.http.get<Object[]>('/project/getprojecthourslogext?scodproject='+ scodproject, this.httpOptions);
  }

  insuprojecthourslog(project): Observable<any> {
    return this.http.post<any>('/project/insuprojecthourslog', project);
  }

  getocupabilidad(nid:number,nid_area: number, dateini:string, datefin: string): Observable<any> {
    return this.http.get<any>('/project/getocupabilidad?nid='+ nid + '&&nid_area=' + nid_area + '&&fechaini='+ dateini + '&&fechafin=' + datefin, this.httpOptions);
  }

  getpersonalexternal(nid:number): Observable<any> {
    return this.http.get<any>('/project/getpersonalexternal?nid='+ nid, this.httpOptions);
  }

  getmanagerarea(scodproject): Observable<any>{
    return this.http.get<any>('/project/getmanagerarea?scodproject='+ scodproject,this.httpOptions)
  }

  insupprovext(provext): Observable<any> {
    return this.http.post<any>('/project/insupprovext', provext);
  }

  insupprojectweeksperson(project): Observable<any> {
    return this.http.post<any>('/project/insupprojectweeksperson', project);
  }
  getprojectweekperson(scodproject): Observable<any> {
    return this.http.get<any>('/project/getprojectweekperson?scodproject='+ scodproject,this.httpOptions);
  }
  insupprojectprogress(project): Observable<any> {
    return this.http.post<any>('/project/insupprojectprogress', project);
  }
  getprojectprogress(scodproject): Observable<any> {
    return this.http.get<any>('/project/getprojectprogress?scodproject='+ scodproject,this.httpOptions);
  }
  getcdcbyproject(nid_project:number): Observable<Object[]> {
    return this.http.get<Object[]>('/project/getcdcbyproject/' + nid_project, this.httpOptions);
  }
}
