import { Component, OnInit } from '@angular/core';
import { FormControl } from "@angular/forms";
import {debounceTime, distinctUntilChanged, finalize, switchMap, tap} from "rxjs/operators";
import { Router } from "@angular/router";
import { AutocompleteService } from "./shared/autocomplete.service";
import { AutocompleteModel } from "./shared/autocomplete.model";

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css'],
  providers: [AutocompleteService]
})

export class AutocompleteComponent implements OnInit {
  fetchedData: AutocompleteModel[];
  formControl = new FormControl();
  isLoading: boolean = false;

  constructor(private service: AutocompleteService, private router: Router) { }

  ngOnInit(): void {
    this.formControl.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => this.isLoading = true),
      switchMap((term: string) => this.service.getAutocompleteData(term).pipe(
        finalize(() => this.isLoading = false)
      ))
    ).subscribe(data => this.fetchedData = data, err => console.log(err) );
  }

  navigateToDetails() {
    if (this.formControl.value)
      this.router.navigate(['/details', this.formControl.value ]).catch(err => console.log(err));
   }

}
