import request from 'superagent';
import cleanDictData from './dictDataHandlers/cleanDictData.js';
import generateDictDom from './dictDataHandlers/generateDictDom.js';
import cleanIconData from './iconDataHandlers/cleanIconData.js';
import generateIconDom from './iconDataHandlers/generateIconDom.js';
import generateAnimDomElements from '../generateAnimDomElements.js';
import staggerAnimation from '../staggerAnimation.js';
import handleError from './handleError.js';

/////////// handle request ///////////

export default function newRequest(param, resolve) {
  request.get(`/api${param}`)
         .then((data) => {

          // document.write(JSON.stringify(data.body.returnItem.dictData))
          console.log(data.body.returnItem);

          new Promise((resolve, reject) => { cleanDictData(data.body.returnItem.dictData.results[0], resolve); })
            .then(dictObject => { generateDictDom(dictObject); });

          new Promise((resolve, reject) => { cleanIconData(data.body.returnItem.iconData, resolve); })
            .then((cleanIconObjects, resolve) => { generateIconDom(cleanIconObjects, resolve); });

          new Promise((resolve, reject) => { generateAnimDomElements(data.body.returnItem.iconData, resolve); })
            .then(allAnimSets => { staggerAnimation(allAnimSets); })
          })

          .catch(err => { handleError(err); })
          // if (!resolve) return;
          resolve('donewithRequest');
}