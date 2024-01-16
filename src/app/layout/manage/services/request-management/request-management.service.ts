import { HttpClient,HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DropDownList } from "../../model/dropdownlist/DropDownList";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RequestManagementService {
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
  constructor(private http: HttpClient) { }

  getrequestpagination(parameters): Observable<Object[]> {
    return this.http.post<Object[]>('/RequestManagement/getrequestpagination', parameters);
  }

  getrequestmanagement(parameters): Observable<any> {
    return this.http.post<any>('/RequestManagement/getrequestmanagement', parameters);
  }

  getmanagementpermission(objeto): Observable<any> {
    return this.http.post<any>('/RequestManagement/getmanagementpermission', objeto);
  }

  insuprequestmanagement(parameters): Observable<any> {
    return this.http.post<any>('/RequestManagement/insuprequestmanagement', parameters);
  }

  insupmanagementpermission(parameters): Observable<any> {
    return this.http.post<any>('/RequestManagement/insupmanagementpermission', parameters)
  }

  getviewsall(option): Observable<any> {
    return this.http.get<any>('/RequestManagement/getviewsmenu?option='+ option,this.httpOptions);
  }
}
