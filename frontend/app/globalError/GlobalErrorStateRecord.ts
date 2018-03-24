import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';

const initialAckDate = new Date();

export interface GlobalError {
  lastAckDate: Date;
  date: Date;
  error: Error;
}

const defaultGlobalError: GlobalError = {
  lastAckDate: initialAckDate,
  date: initialAckDate,
  error: new Error(),
};

export interface IGlobalErrorStateRecord extends TypedRecord<IGlobalErrorStateRecord>, GlobalError {
}

export const GlobalErrorStateRecordFactory = makeTypedFactory<GlobalError, IGlobalErrorStateRecord>(defaultGlobalError);

export const initialGlobalErrorState = GlobalErrorStateRecordFactory();
