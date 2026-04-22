import { metadataPipe } from '@piying/valibot-visit';
import { actions } from '@piying/view-angular-core';

export const topLabelPosition = metadataPipe(
  actions.props.patch({
    labelPosition: 'top',
  }),
);
