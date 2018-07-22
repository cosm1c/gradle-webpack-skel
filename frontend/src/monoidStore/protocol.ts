import {MONOID_STORE_APPLY, monoidStoreApply} from './actions';
import {MonoidStoreAction} from './redux-duck';

export function jsonToMonoidActions(json: any): MonoidStoreAction {
  const removes: string[][] = [];

  function traverseObject(path: string[], obj: any) {
    for (const i in obj) {
      if (obj.hasOwnProperty(i)) {
        const curr = obj[i];

        if (curr === null) {
          removes.push(path.concat([i]));
          delete obj[i];

        } else if (typeof curr === 'object') {
          traverseObject(path.concat([i]), curr);
        }
      }
    }
  }

  traverseObject([], json);

  return monoidStoreApply(removes, json);
}

export function jsonToNestedMonoidActions(path: string, json: any): MonoidStoreAction {
  const monoidStoreAction: MonoidStoreAction = jsonToMonoidActions(json);

  if (monoidStoreAction.type === MONOID_STORE_APPLY) {
    const pathArray = [path];
    return monoidStoreApply(
      monoidStoreAction.payload.removePaths.map((value) => pathArray.concat(value)),
      {[path]: monoidStoreAction.payload.upsert}
    );
  }

  throw new Error(`Expected MONOID_STORE_APPLY to nest with ${path}`);
}
