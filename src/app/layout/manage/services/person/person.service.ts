import { HttpClient,HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DropDownList } from "../../model/dropdownlist/DropDownList";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class PersonService {
    httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
    constructor(private http: HttpClient) { }

    listaPersonaPaginado(parameter: any): Observable<any> {
        return this.http.post<any>('/Person/getlistpersonpagination', parameter);
    }

    managementPerson(payload:any): Observable<any> {
        //console.log("service",payload);
        return this.http.post<any>('/Person/insupperson', payload)
       
    }

    deleteperson(id: number): Observable<any> {
        return this.http.put<any>('/Person/' + id, {})
    }

    getDocumentType(): Observable<any> {
        return this.http.get<any>('/Person/listtypeDocument');
    }
    

    getListState(): Observable<any> {
        return this.http.get<any>('/Person/listState');
    }
    
    getDropdownlist(): Observable<DropDownList[]> {
        return this.http.get<any>('/Person/getdropdownlist');
    }
    getPersonCostList(): Observable<any[]> {
        return this.http.get<any>('/Person/getpersonlistcost');
    }

    getPersonCostHist(nid_person): Observable<any> {
    return this.http.get<any>('/Person/getpersoncosthist?nid_person='+ nid_person,this.httpOptions);
    }
    getPersonCostByScodproject(scodproject): Observable<any> {
        return this.http.get<any>('/Person/getpersoncostbyscodproject?scodproject='+ scodproject,this.httpOptions);
    }
    uploadCostDocument(project): Observable<any> {
        return this.http.post<any>('/Person/uploadcostdocument', project);
    }
    
    getcontribution(nid_person,anho, mes) {
        return this.http.get<any>('/Person/getpersoncontribution?nid_person='+ nid_person + '&&anho=' + anho + '&&mes=' + mes,this.httpOptions); 
    }

    personmanagerjp(option) {
        return this.http.get<any>('/Person/personmanagerjp?option='+ option,this.httpOptions);
    }
}
