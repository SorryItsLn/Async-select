import { Directive, OnInit, output } from '@angular/core'

@Directive({
  selector: '[muiHandleTrigger]',
})
export class HandleTriggerDirective implements OnInit {
  readonly init = output()

  ngOnInit(): void {
    this.init.emit()
  }
}
