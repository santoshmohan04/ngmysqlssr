import { Component, OnInit } from '@angular/core';
import { UserService } from './api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ngdbcon';
  constructor(private readonly apiService: UserService) {}
  tabledata:any

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.apiService.getUsers().subscribe((users) => {
      console.log("users >>> ", users);
      this.tabledata = users;
    });
  }
}
