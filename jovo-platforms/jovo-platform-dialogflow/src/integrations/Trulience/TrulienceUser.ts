import { Jovo } from 'jovo-core';
import _get = require('lodash.get');
import { DialogflowUser } from '../../DialogflowUser';

export class TrulienceUser extends DialogflowUser {
  constructor(jovo: Jovo) {
    super(jovo);
  }

  getAccessToken(): string | undefined {
    return _get(this.jovo.$request, 'originalDetectIntentRequest.payload.user.accessToken');
  }
}
