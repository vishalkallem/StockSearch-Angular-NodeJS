import { Component, OnInit } from '@angular/core';
import { DetailsService } from '../shared/details.service';
import { ActivatedRoute } from '@angular/router';
import { NewsModel } from '../shared/news.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {
  private ticker: string;
  pageLoaded: Promise<boolean>;
  modalInformation: NewsModel;
  data: [NewsModel, NewsModel][] = [];

  constructor(private service: DetailsService, private route: ActivatedRoute, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.ticker = this.route.snapshot.params.ticker.toUpperCase();
    this.service.getNewsDetails(this.ticker).subscribe(data => {
      for (let i = 0; i < data.length; i += 2) {
        this.data.push([data[i], data[i + 1]]);
      }
      this.pageLoaded = Promise.resolve(true);
    }, err => {
      this.pageLoaded = Promise.resolve(true);
      console.log(err);
    });
  }

  openModal(modalElement, data: NewsModel) {
    this.modalService.open(modalElement);
    this.modalInformation = data;
  }

  closeModal(modalElement): void {
    this.modalService.dismissAll(modalElement);
  }

  encodeURIComponent(text: string) {
    return encodeURIComponent(text);
  }
}
