import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router,NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-incorrecta',
  templateUrl: './incorrecta.page.html',
  styleUrls: ['./incorrecta.page.scss'],
})
export class IncorrectaPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  public home(){
    this.router.navigate(['/login']);
  }
}
