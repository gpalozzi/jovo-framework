import { Jovo } from 'jovo-core';
import _get = require('lodash.get');
import { DialogflowUser } from '../../DialogflowUser';
import { TruliencePayload, TrulienceUserPayload } from './Interfaces';

export class TrulienceUser extends DialogflowUser {
  private truliencePayload: TruliencePayload;

  constructor(jovo: Jovo) {
    super(jovo);
    this.truliencePayload = _get(jovo.$request, 'originalDetectIntentRequest.payload');
  }

  getAccessToken(): string | undefined {
    return this.truliencePayload.user.accessToken;
  }

  getTwilioUserPayload(): TrulienceUserPayload {
    return this.truliencePayload.user;
  }
}
