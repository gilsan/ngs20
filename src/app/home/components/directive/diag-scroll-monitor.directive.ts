import { Directive, HostListener } from '@angular/core';
import { StoreService } from 'src/app/forms/store.current';


@Directive({
  selector: '[appDiagScrollMonitor]'
})
export class DiagScrollMonitorDirective {

  constructor(
    private store: StoreService
  ) { }

  @HostListener('scroll', ['$event'])
  scrolly($event): void {
    if ($event.target.scrollTop !== 0) {
      // const scrolltop = this.store.getScrollyPosition();
      this.store.setScrollyPosition($event.target.scrollTop);
    }
  }

}
