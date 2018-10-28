/*
 * vueMerge.ts
 */

import Vue from 'vue';

type PathType = string[];
type UpsertType = [PathType, any];

export function vueMerge(json: any, target: any): void {

  const upserts: UpsertType[] = [];
  const removes: PathType[] = [];

  function traverseObject(path: string[], obj: any) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const currField = obj[key];
        const currPath = path.concat([key]);

        if (currField === null) {
          removes.push(currPath);

        } else if (typeof currField === 'object' && !Array.isArray(currField)) {
          traverseObject(currPath, currField);

        } else {
          upserts.push([currPath, currField]);
        }
      }
    }
  }

  traverseObject([], json);

  upserts.forEach((upsert) => {
    const upsertPath = upsert[0];
    const updatedValue = upsert[1];
    const pathLength = upsertPath.length;

    let currTarget = target;
    upsertPath.forEach((pathItem, index) => {

      if (index === pathLength - 1) {
        if (currTarget[pathItem] !== updatedValue) {
          Vue.set(currTarget, pathItem, updatedValue);
        }

      } else {
        if (!currTarget.hasOwnProperty(pathItem)) {
          Vue.set(currTarget, pathItem, {});
        }

        currTarget = currTarget[pathItem];
      }
    });
  });

  removes.forEach((removePath) => {
    const pathLength = removePath.length;

    let currTarget = target;
    removePath.every((pathItem, index) => {

      if (currTarget.hasOwnProperty(pathItem)) {
        if (index === pathLength - 1) {
          Vue.delete(currTarget, pathItem);

        } else {
          currTarget = currTarget[pathItem];
          return true;
        }
      }

      return false;
    });
  });
}
