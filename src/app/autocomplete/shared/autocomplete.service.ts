import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {AutocompleteModel} from "./autocomplete.model";

@Injectable({
  providedIn: 'root'
})
export class AutocompleteService {

  constructor(private http: HttpClient) { }

  getAutocompleteData(ticker: string): Observable<AutocompleteModel[]> {
    if (!ticker.length || !ticker) {
      return of([]);
    }

    return this.http.get<AutocompleteModel[]>(`/api/autocomplete/${ticker}`);
  }
}
