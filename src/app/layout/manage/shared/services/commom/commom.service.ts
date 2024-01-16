import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { Clinica } from 'src/app/layout/manage/shared/models/clinica';
import { Pro_Profiles } from 'src/app/layout/manage/shared/models/pro_Profiles';
import { Observable } from 'rxjs';
import { Menu } from '../../../model/menu/menu';
import { MenuFiltro } from '../../../model/menu/menu-filtro';

@Injectable({
  providedIn: 'root'
})
export class CommomService {

  httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(private http: HttpClient) { }


  getClinicas(): Observable<Clinica[]> {
    return this.http.get<Clinica[]>(
      environment.apiUrl + '/Shared/GetClinicas/'
    );
  }

  getPerfiles(): Observable<Pro_Profiles[]> {
    return this.http.get<Pro_Profiles[]>(
      environment.apiUrl + '/Shared/GetPerfiles/'
    );
  }

  updateMenu(params: MenuFiltro): Observable<Menu[]> {
    return this.http.post<Menu[]>(
      environment.apiUrl + '/Menu/UpdateMenu',
      params,
      this.httpOptions
    );
  }

  getMenu(): Observable<Menu[]> {
    return this.http.get<Menu[]>('/common/getmenu' ,this.httpOptions);
  }


}
