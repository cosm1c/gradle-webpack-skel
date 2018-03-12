import {MonoidAction, monoidActionCreators} from './actions';

export function jsonToMonoidActions(json: any): MonoidAction {
  let removes: string[][] = [];

  function traverseObject(path: string[], obj: any) {
    for (let i in obj) {
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

  return monoidActionCreators.monoidApply(removes, json);
}
