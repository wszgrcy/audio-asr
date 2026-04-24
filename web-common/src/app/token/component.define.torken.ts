import { InjectionToken, Signal } from '@angular/core';
import type { ConnectConfigType } from '../piying/page-define/login';
import { typedComponent } from '@piying/view-angular';

export const ComponentDefineToken = new InjectionToken<
  ReturnType<typeof typedComponent>
>('ConnectStoreToken');
