import { computed, Injectable, isSignal, linkedSignal } from '@angular/core';
import {
  AngularFormBuilder,
  PiResolvedViewFieldConfig,
  NgSchemaHandle,
} from '@piying/view-angular';
import { deepEqual } from 'fast-equals';
function getSignalValue(inputs: any) {
  return isSignal(inputs) ? inputs() : inputs;
}
@Injectable()
export class CustomNgBuilder extends AngularFormBuilder {
  override afterResolveConfig(
    rawConfig: NgSchemaHandle,
    config: PiResolvedViewFieldConfig,
  ) {
    const parsed = super.afterResolveConfig(rawConfig, config) ?? config;
    const props = parsed.props;
    const inputs = parsed.inputs;

    const options$$ = computed(
      () => {
        return getSignalValue(props)?.['options'];
      },
      { equal: deepEqual },
    );
    const inputs$$ = linkedSignal(() => {
      let value = getSignalValue(inputs);
      if (rawConfig.type === 'picklist') {
        const options = options$$();
        if (options && !value.options) {
          value = { ...value, options };
        }
      }
      return value;
    });

    return {
      ...parsed,
      inputs: inputs$$,
    } as any;
  }
}
