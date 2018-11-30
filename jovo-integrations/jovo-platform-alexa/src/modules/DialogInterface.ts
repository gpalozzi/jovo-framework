import {Plugin} from 'jovo-core';
import {Alexa} from "../Alexa";
import * as _ from "lodash";
import {AlexaRequest, Intent} from "../core/AlexaRequest";
import {AlexaSkill} from "../core/AlexaSkill";
import {AlexaSpeechBuilder} from "../core/AlexaSpeechBuilder";
import {AlexaResponse} from "..";

export class DialogInterface implements Plugin {
    install(alexa: Alexa) {

        alexa.middleware('$request')!.use(this.request.bind(this));
        alexa.middleware('$output')!.use(this.output.bind(this));

        AlexaSkill.prototype.dialog = function() {
            return this.$plugins.DialogInterface.dialog;
        };
    }
    uninstall(alexa: Alexa) {
    }
    private request(alexaSkill: AlexaSkill) {
        _.set(alexaSkill.$plugins, 'DialogInterface.dialog', new Dialog(alexaSkill));
    }

    private output(alexaSkill: AlexaSkill) {
        const output = alexaSkill.$output;
        if (!alexaSkill.$response) {
            alexaSkill.$response = new AlexaResponse();
        }
        if (_.get(output, 'Alexa.Dialog')) {
            _.set(alexaSkill.$response, 'response.shouldEndSession', false);
            _.set(alexaSkill.$response, 'response.directives',
                [_.get(output, 'Alexa.Dialog')]
            );
        }
    }
}

export class Dialog {
    alexaSkill: AlexaSkill;
    alexaRequest: AlexaRequest;

    constructor(alexaSkill: AlexaSkill) {
        this.alexaSkill = alexaSkill;
        this.alexaRequest = alexaSkill.$request as AlexaRequest;

    }

    /**
     * Returns state of dialog
     * @public
     * @return {BaseApp.DIALOGSTATE_ENUM}
     */
    getState() {
        return _.get(this.alexaRequest, 'request.dialogState');
    }


    /**
     * Returns true if dialog is in state COMPLETED
     * @public
     * @return {boolean}
     */
    isCompleted() {
        return this.getState() === 'COMPLETED';
    }


    /**
     * Returns true if dialog is in state IN_PROGRESS
     * @public
     * @return {boolean}
     */
    isInProgress() {
        return this.getState() === 'IN_PROGRESS';
    }


    /**
     * Returns true if dialog is in state STARTED
     * @public
     * @return {boolean}
     */
    isStarted() {
        return this.getState() === 'STARTED';
    }

    /**
     * Returns true if dialog is in state STARTED
     * @public
     * @return {boolean}
     */
    hasStarted() {
        return this.isStarted();
    }

    /**
     * Creates delegate directive. Alexa handles next dialog
     * step by her(?)self.
     * @param {object} updatedIntent
     * @return {AlexaResponse}
     */
    delegate(updatedIntent?: Intent) {
        _.set(this.alexaSkill.$output, 'Alexa.Dialog',
            new DialogDelegateDirective(updatedIntent)
        );
        return this.alexaSkill;
    }

    /**
     * Let alexa ask user for the value of a specific slot
     * @public
     * @param {string} slotToElicit name of the slot
     * @param {string} speech
     * @param {string} reprompt
     * @param {object} updatedIntent
     */
    elicitSlot(slotToElicit: string, speech: string | AlexaSpeechBuilder, reprompt: string | AlexaSpeechBuilder, updatedIntent?: Intent) {
        _.set(this.alexaSkill.$output, 'ask',{
            speech,
            reprompt
        });
        _.set(this.alexaSkill.$output, 'Alexa.Dialog',
            new DialogElicitSlotDirective(slotToElicit, updatedIntent)
        );
        return this.alexaSkill;
    }

    /**
     * Let alexa ask user to confirm slot with yes or no
     * @public
     * @param {string} slotToConfirm name of the slot
     * @param {string} speech
     * @param {string} reprompt
     * @param {object} updatedIntent
     */
    confirmSlot(slotToConfirm: string, speech: string | AlexaSpeechBuilder, reprompt: string | AlexaSpeechBuilder, updatedIntent?: Intent) {
        _.set(this.alexaSkill.$output, 'ask',{
            speech,
            reprompt
        });
        _.set(this.alexaSkill.$output, 'Alexa.Dialog',
            new DialogConfirmSlotDirective(slotToConfirm, updatedIntent)
        );
        return this.alexaSkill;
    }

    /**
     * Asks for intent confirmation
     * @public
     * @param {string} speech
     * @param {string} reprompt
     * @param {object} updatedIntent
     */
    confirmIntent(speech: string | AlexaSpeechBuilder, reprompt: string | AlexaSpeechBuilder, updatedIntent?: Intent) {
        _.set(this.alexaSkill.$output, 'ask',{
            speech,
            reprompt
        });
        _.set(this.alexaSkill.$output, 'Alexa.Dialog',
            new DialogConfirmIntentDirective(updatedIntent)
        );
        return this.alexaSkill;
    }

}

// TODO: Optimize me
abstract class DialogDirective {
    type: string;
    updatedIntent?: Intent;

    constructor(type: string, updatedIntent?: Intent) {
        this.type = type;
        this.updatedIntent = updatedIntent;
    }
}
class DialogDelegateDirective extends DialogDirective {
    constructor(updatedIntent?: Intent) {
        super('Dialog.Delegate', updatedIntent);
    }
}
class DialogElicitSlotDirective extends DialogDirective {
    slotToElicit: string;
    constructor(slotToElicit: string, updatedIntent?: Intent) {
        super('Dialog.ElicitSlot', updatedIntent);
        this.slotToElicit = slotToElicit;
    }
}

class DialogConfirmSlotDirective extends DialogDirective {
    slotToConfirm: string;
    constructor(slotToConfirm: string, updatedIntent?: Intent) {
        super('Dialog.ConfirmSlot', updatedIntent);
        this.slotToConfirm = slotToConfirm;
    }
}
class DialogConfirmIntentDirective extends DialogDirective {
    constructor(updatedIntent?: Intent) {
        super('Dialog.ConfirmIntent', updatedIntent);
    }
}