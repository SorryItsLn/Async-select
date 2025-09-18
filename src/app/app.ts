import { Component } from '@angular/core';
import { TuiRoot } from '@taiga-ui/core';
import { MUISelect } from '../../libs/my-ui-lib/src';

@Component({
  imports: [TuiRoot, MUISelect],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
