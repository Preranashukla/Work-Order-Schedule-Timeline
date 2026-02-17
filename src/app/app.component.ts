import { Component } from '@angular/core';
import { TimelineContainerComponent } from './features/timeline/timeline-container/timeline-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TimelineContainerComponent],
  template: `
    <app-timeline-container />
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }
  `]
})
export class AppComponent {}
