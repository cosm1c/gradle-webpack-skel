import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';

const initialAckDate = new Date();

export interface GlobalAlert {
  lastAckDate: Date;
  date: Date;
  message: string;
  color: string;
}

const defaultGlobalAlert: GlobalAlert = {
  lastAckDate: initialAckDate,
  date: initialAckDate,
  message: '',
  color: 'primary',
};

export interface IGlobalAlertStateRecord extends TypedRecord<IGlobalAlertStateRecord>, GlobalAlert {
}

export const GlobalAlertStateRecordFactory = makeTypedFactory<GlobalAlert, IGlobalAlertStateRecord>(defaultGlobalAlert);

export const initialGlobalAlertState = GlobalAlertStateRecordFactory();
