import { Plugin, BaseApp } from 'jovo-core';
import { Config } from '../../DialogflowCore';
import { Dialogflow } from '../../Dialogflow';
import { DialogflowAgent } from '../../DialogflowAgent';
import { TrulienceUser } from './TrulienceUser';

export interface TrulienceConfig extends Config {
  source: string;
}

export class Trulience implements Plugin {
  config: TrulienceConfig = {
    enabled: true,
    source: 'Trulience',
  };

  constructor(config?: Config) {}

  install(dialogFlow: Dialogflow) {
    dialogFlow.middleware('$type')!.use(this.type.bind(this));

    const source = this.config.source;
    DialogflowAgent.prototype.isTrulienceBot = function() {
      return this.getSource() === source;
    };
  }

  uninstall(app: BaseApp) {}

  type(dialogflowAgent: DialogflowAgent) {
    dialogflowAgent.$user = new TrulienceUser(dialogflowAgent);
  }
}
