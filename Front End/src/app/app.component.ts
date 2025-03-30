import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title(title: any) {
    throw new Error('Method not implemented.');
  }

}


