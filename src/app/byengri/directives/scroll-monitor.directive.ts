import { Directive, HostListener } from '@angular/core';
import { StorePathService } from '../store.path.service';

@Directive({
  selector: '[appScrollMonitor]'
})
export class ScrollMonitorDirective {
  constructor(
    private store: StorePathService
  ) { }

  @HostListener('scroll', ['$event'])
  scrolly($event): void {
    this.store.setScrollyPosition($event.target.scrollTop);
  }



}
