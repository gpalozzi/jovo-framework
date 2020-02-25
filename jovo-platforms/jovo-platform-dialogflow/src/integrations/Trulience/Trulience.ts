import { Plugin, BaseApp } from 'jovo-core';
import _get = require('lodash.get');
import { Config } from '../../DialogflowCore';
import { Dialogflow } from '../../Dialogflow';
import { DialogflowAgent } from '../../DialogflowAgent';
import { TrulienceUser } from './TrulienceUser';

export class Trulience implements Plugin {
  config: Config = {
    enabled: true,
  };

  constructor(config?: Config) {}

  install(dialogFlow: Dialogflow) {
    dialogFlow.middleware('$type')!.use(this.type.bind(this));

    DialogflowAgent.prototype.isTrulienceBot = function() {
      return _get(this.$request, 'originalDetectIntentRequest.source') === 'Trulience';
    };
  }

  uninstall(app: BaseApp) {}

  type(dialogflowAgent: DialogflowAgent) {
    if (dialogflowAgent.isTrulienceBot()) {
      dialogflowAgent.$user = new TrulienceUser(dialogflowAgent);
    }
  }
}
