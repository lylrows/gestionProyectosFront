import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
//import { ErrorDialogService } from '../main/error/error.service';
import { HttpInterceptor, HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpErrorResponse, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
    private readonly urlBase: string = environment.apiUrl;
    private readonly urlSispocBase: string = environment.sispocBasePath;
    constructor(
        //    public errorDialogService: ErrorDialogService
        private router: Router
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {        
        const token: string = sessionStorage.getItem('Guard');
        

        if (token && request.headers.get('Custom-Query') == null) {
            request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + token) });
        }
        if (request.body instanceof FormData) {
            //request = request.clone({ headers: request.headers.set('Content-Type', 'multipart/form-data') });            
        }
        else {
            request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
        }
        //request.headers.set('Origin', 'http://localhost:4200');

        if (request.headers.get('Custom-Query') != null) {
            //request.headers.set('timeout', '15000');
            request = request.clone({ url: `${this.urlSispocBase}${request.url}`, headers: request.headers.set('Accept', 'application/json') });
        }
        else {
            request = request.clone({ url: `${this.urlBase}${request.url}`, headers: request.headers.set('Accept', 'application/json') });
        }
        return next.handle(request).pipe(
            tap(() => { },
                (err: any) => {      
                    console.log('error http', err);              
                    if (err instanceof HttpErrorResponse) {
                        
                        if (err.status !== 401) {
                            return;
                        }
                        sessionStorage.clear();
                        window.location.href = environment.localUrl;
                        //this.router.navigate(['manage/login']);
                        //this.router.navigate(['client/paso04']);
                        //this.router.navigate(['login']);
                    }
                })
            // map((event: HttpEvent<any>) => {
            //     if (event instanceof HttpResponse) { }

            //     return event;
            // }),
            // catchError(error => {
            //     if (error instanceof HttpErrorResponse && error.status === 401) {
            //         // calling refresh token api and if got success extracting token from response and calling failed api due to 401                    
            //         console.log(error);
            //         //return this.handle401Error(request, next);
            //     } // If api not throwing 401 but gives an error throwing error
            //     else {
            //         return throwError(error);
            //     }
            // })
            // catchError((error: HttpErrorResponse) => {
            //     let data = {};
            //     data = {
            //         reason: error && error.error && error.error.reason ? error.error.reason : '',
            //         status: error.status
            //     };
            //     //this.errorDialogService.openDialog(data);
            //     return throwError(error);
            // })

        );
    }
}