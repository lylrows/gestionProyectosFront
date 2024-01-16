import { Pipe , PipeTransform } from "@angular/core";

@Pipe({
    name: 'filtro'
})
export class FiltroPipe implements PipeTransform {
    transform(lista: any[], ...args: any[]): any[] {
        console.log(lista);
        console.log(lista.slice(0,5));
        return lista.slice(0,5);
    }
}