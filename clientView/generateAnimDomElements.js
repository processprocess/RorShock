import "pixi.js";
import "gsap";
import Draggable from '../node_modules/gsap/Draggable.js';
import './libs/PixiPlugin.js';
import ThrowPropsPlugin from './libs/ThrowPropsPlugin.js';
import { colorPallete } from './handleRequestChange/newRequest.js';
import { randomColorRequest } from './handleRequestChange/newRequest.js';
import ColorPropsPlugin from '../node_modules/gsap/ColorPropsPlugin.js';
import { changeLocation } from './animations.js';
import { currentParam } from './handleRequestChange/handleChange.js';
import handleChange from './handleRequestChange/handleChange.js';
import getRandomVal from './getRandomVal.js';
import newRequest from './handleRequestChange/newRequest.js';
import InfoDom from './InfoDom.js';
import IntroAnim from './IntroAnim.js';

export let allAnimSets = [];

let leftBox;
let rightBox;
let bgCover;
let filter;
let allSets = [];
let loader;
let stage;
let renderer;

/////////// set up pixi ///////////

function setUp() {
  renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {
    view: document.querySelector("canvas"),
    antialias: true,
    transparent: true,
    resolution: 1
  });

  loader = new PIXI.loaders.Loader()
  stage = new PIXI.Container();

  stage.interactive = true;
  // stage.on('click', function(e) {
  //   shuffle()
  // });

  TweenLite.ticker.addEventListener("tick", () => { renderer.render(stage) });

  bgCover = new PIXI.Graphics();
  bgCover.beginFill(0xffffff, 1);
  bgCover.drawRect(0, 0, window.innerWidth, window.innerHeight);
  stage.addChild(bgCover);

  leftBox = new PIXI.Graphics();
  leftBox.beginFill(0xffffff, 1);
  leftBox.drawRect(0, 0, window.innerWidth/2, window.innerHeight);
  stage.addChild(leftBox);

  rightBox = new PIXI.Graphics();
  rightBox.beginFill(0xffffff, 1);
  rightBox.drawRect(window.innerWidth/2, 0, window.innerWidth/2, window.innerHeight);
  stage.addChild(rightBox);
}
setUp()

/////////// parse Json ///////////

export default function generateAnimDomElements (iconData, resolve) {
  loader.reset(true)
  iconData.forEach((data, index) => {
    let url = data.previewURL
    let newurl = url.replace('https', 'http')
    loader.add(`item${index}`, newurl)
    if(index === iconData.length - 1){
      loader.load(generateElements);
    }
  })

  function generateElements(loader, resources){
    let elementCount = iconData.length

    for( let i = 0 ; i < elementCount ; i++){

      var ogTexture = eval(`resources.item${i}.texture`);
      var width  = ogTexture.width;
      var height = ogTexture.height;

      for( let i = 0 ; i < 2 ; i++){

        var renderTarget = new PIXI.CanvasRenderTarget(width, height);
        PIXI.CanvasTinter.tintWithOverlay(ogTexture, 0xffffff, renderTarget.canvas);

        var whiteTexture = PIXI.Texture.fromCanvas(renderTarget.canvas);
        var lightSprite = new PIXI.Sprite(whiteTexture);

        renderTarget.destroy();

        let animL = new PIXI.Sprite(whiteTexture);
        stage.addChild(animL);
        let animR = new PIXI.Sprite(whiteTexture);
        stage.addChild(animR);

        animL.mask = leftBox;
        animL.name = 'animL';

        animR.mask = rightBox;
        animR.name = 'animR';

        allSets.push([animL, animR]);

        /////////// set values ////////////

        TweenMax.set(animL, {
          pixi: {
            anchor: 0.5,
            scaleX: 0,
            scaleY: 0,
            x: window.innerWidth/2 + animL.width/2,
            y: window.innerHeight/2,
          },
          colorProps: {
            tint: 0x000000,
          },
        });

        TweenMax.set(animR, {
          pixi: {
            anchor: 0.5,
            scaleX: 0,
            scaleY: 0,
            x: window.innerWidth/2 - animR.width/2,
            y: window.innerHeight/2,
          },
          colorProps: {
            tint: 0x000000,
          },
        });

        /////////// set events ////////////

        // animL.interactive = true;
        // animL.on('mouseover', function(e) {
        //   randomLocaiton([[animL, animR]], {duration:1, stagger:0})
        // });
        //
        // animR.interactive = true;
        // animR.on('mouseover', function(e) {
        //   randomLocaiton([[animL, animR]], {duration:1, stagger:0})
        // });

      }
    }
    resolve()
  }
}

/////////// custom loader ///////////

loader.on("progress", loadProgressHandler)
let progress = document.querySelector('.progress')
function loadProgressHandler(loader, resource) {
  progress.textContent = loader.progress + "%"
}

///////////// random location  ////////////

let xMin = window.innerWidth/4;
let xMax = window.innerWidth/2 + 50;

let yMin = window.innerHeight/5.5 + 50;
let yMax = window.innerHeight/1.50 + 50;

export function randomLocaiton(elements, options, resolve) {

  options = options || {};
  let duration = options.duration || 0.2;
  let stagger = (options.stagger == null) ? 0.3 : options.stagger || 0;
  let tl = new TimelineLite( {onComplete:resolve} );

  elements.forEach((element, i) => {
    let animL = element[0]
    let animR = element[1]

    let endX = randomInt(xMin, xMax);
    let endY = randomInt(yMin, yMax);
    let scale = ((endX - xMin)) / (xMax - xMin)

    tl.add(
      TweenLite.to(animL, duration, {
        pixi: {
          x:(index, element) => {
            return endX
          },
          y: endY,
          scale: scale,
        },
        ease: Power1.easeInOut,
      }, stagger * i),

      TweenLite.to(animR, duration, {
        pixi: {
          x: () => renderer.view.width - endX,
          y: endY,
          scaleX: ()=> scale*-1,
          scaleY: scale,
        },
        ease: Power1.easeInOut,
      }, 0)
    )

  })
  return tl;
}


///////////// changeBG color ////////////

function changeBGColor() {
  TweenMax.to(bgCover, 0.5, {colorProps: {
      tint: colorPallete[0], format:"number"
    }
  });
}

///////////// change element color ////////////

export function changeElementColor(elements, options) {

  options = options || {};
  let duration = options.duration || 0.2;
  let stagger = (options.stagger == null) ? 0.3 : options.stagger || 0;
  let tl = new TimelineLite( {} );

  elements.forEach((element, i) => {
    let animL = element[0]
    let animR = element[1]
    let tint = colorPallete[Math.floor(getRandomVal(1, colorPallete.length))];

    tl.add(

      TweenMax.to(animL, duration, {colorProps: {
          tint: tint, format:"number",
        },
      }, stagger * i),

      TweenMax.to(animR, duration, {colorProps: {
          tint: tint, format:"number",
        }
      }, 0)

    )

  })
  return tl;
}

///////////// animateOut ////////////

export function animateOut(elements, options, resolve) {

  if(elements.length === 0) resolve()

  TweenMax.to(bgCover, 0.5, {colorProps: {
      tint: 0xffffff, format:"number"
    }
  });

  options = options || {};
  let duration = options.duration || 0.2;
  let stagger = (options.stagger == null) ? 0.3 : options.stagger || 0;
  let tl = new TimelineLite( {onComplete:resolve} );

  elements.forEach((element, i) => {
    let animL = element[0]
    let animR = element[1]

    tl.add(

      TweenLite.to(animL, duration, { pixi: {
        x: window.innerWidth/2 + animL.width,
        y: window.innerHeight/2,
      },
        ease: Power1.easeInOut,
      }, stagger * i),

      TweenLite.to(animR, duration, { pixi: {
        x: window.innerWidth/2 - animR.width,
        y: window.innerHeight/2,
      },
        ease: Power1.easeInOut,
      }, 0)

    )

  })
  return tl;
}

///////////// shuffle all elements ////////////

function shuffle() {
  randomColorRequest();
  changeBGColor();
  randomLocaiton(allSets, {duration:1, stagger:0})
  changeElementColor(allSets, {duration:1, stagger:0})
}

document.querySelector('.shuffleButton').addEventListener('click', function(e) {shuffle() }); // debug

///////////// draggable ////////////

let body = document.body;
let dragWrap = document.querySelector('.dragWrap');
let testDiv = document.querySelector('.testDiv');

Draggable.create(testDiv, {
  throwProps: true,
  dragResistance: 0.25,
  edgeResistance: 1,
  throwResistance: 1000,
  onThrowComplete: update,
  onThrowUpdate: update,
  onDrag: update,
  trigger: body,
});

let testDivcords = Draggable.get(testDiv);

let oldx = 0;
let oldy = 0;

// TweenLite.ticker.addEventListener("tick", yourFunction);
//
// function yourFunction() {
//   allSets.forEach((animSet, i)=>{
//     checkPos(animSet);
//     updatePos(animSet, i, 0, .5);
//   })
// }

// function stopMyInterval() { clearInterval(myInterval); };

function update() {
  let newx = Math.floor(testDivcords.x);
  let newy = Math.floor(testDivcords.y);
  let diffx = newx - oldx;
  let diffy = newy - oldy;
  oldx = newx;
  oldy = newy;
  allSets.forEach((animSet, i)=>{
    checkPos(animSet, diffy, diffx);
    updatePos(animSet, i, diffy, diffx);
  })
}

function updatePos(animSet, i, diffy, diffx) {

  if(i%2 === 0) {diffy = diffy/2; diffx = diffx/2}
  else if(i%3 === 0) {diffy = diffy/3; diffx = diffx/3}
  // else {console.log('odd');}

  let animL = animSet[0];
  let animR = animSet[1];

  // let scaleY = (animL.y - yMin);
  // let scaleX = (animL.x - xMin);
  // let scale = ((animL.y - yMin)) / (yMax - yMin);
  let scale = ((animL.x - xMin)) / (xMax - xMin);
  // let scale = (scaleY + scaleX) / ((xMax - xMin) + (yMax - yMin))
  // console.log(scale)

  TweenMax.set(animL, { pixi: {
    y: animL.y + diffy,
    x: animL.x + diffx,
    scaleX:scale,
    scaleY:scale,
  }});

  TweenMax.set(animR, { pixi: {
    y: animL.y,
    x: window.innerWidth - (animL.x),
    scaleX:scale * -1,
    scaleY:scale,
  }});

}

function checkPos(animSet, diffy, diffx) {
  let animL = animSet[0];
  if (animL.x < xMin) { TweenLite.set(animL, { pixi: { x: xMax + 50 }})}
  if (animL.x > xMax + 50) { TweenLite.set(animL, { pixi: { x: xMin }})}
  if (animL.y < yMin - animL.height/2) { TweenLite.set(animL, { pixi: { y: yMax + animL.height/2 }})}
  if (animL.y > yMax + animL.height/2) { TweenLite.set(animL, { pixi: { y: yMin - animL.height/2 }})}
}

///////////// random int ////////////

function randomInt(min, max) {
  return Math.random() * (max - min) + min;
}

///////////// window resize ////////////

window.addEventListener('resize', function(e) {

  renderer.resize(window.innerWidth, window.innerHeight);
  leftBox.width = window.innerWidth/2;
  leftBox.height = window.innerHeight;
  rightBox.width = window.innerWidth/2;
  rightBox.height = window.innerHeight;
  bgCover.width = window.innerWidth;
  bgCover.height = window.innerHeight;

  shuffle();

})

///////////// control flow ////////////

let loadingWrapper = document.querySelector('.loadingWrapper')

export function controlFlow(param) {
  new Promise((resolve, reject) => { animateOut(allSets, {duration:1, stagger:0}, resolve)
  })
  .then((newDataFour) => { return new Promise((resolve, reject) => {
    destroyElements(allSets, resolve);
    })
  })
  // .then((iconDataOnetest) => { return new Promise((resolve, reject) => {
  //   IntroAnim.play(resolve)
  //   loadingWrapper.classList.remove('notVisible');
  //   })
  // })
  .then((iconDataOne) => { return new Promise((resolve, reject) => { newRequest(param, resolve) })
  })
  .then((cleanIconData) => { return new Promise((resolve, reject) => {
    InfoDom.relatedTagsDom(cleanIconData.topTags);
    InfoDom.searchTermDom(cleanIconData.icons[0].term);
    InfoDom.generateAppendix(cleanIconData);
    generateAnimDomElements(cleanIconData.icons, resolve);
    })
  })
  // .then((iconDataOnetesttest) => { return new Promise((resolve, reject) => {
  //   IntroAnim.reverse(resolve)
  //   loadingWrapper.classList.remove('notVisible');
  //   })
  // })
  .then((resolveData) => {
    console.log('done with gen dom')
    randomLocaiton(allSets, {duration:1, stagger:.5})
  })
}

///////////// destroy elements ////////////

function destroyElements(setsToDestroy, resolve) {
  let setsDestroyed = 0;
  if(setsToDestroy.length === 0) resolve()
  setsToDestroy.forEach((set, index) => {
    stage.removeChild(set[0])
    stage.removeChild(set[1])
    set[0].destroy(true)
    set[1].destroy(true)
    setsDestroyed++
    if(setsToDestroy.length === setsDestroyed) {
      allSets = [];
      resolve();
    }
  })
}

controlFlow('randomSample') // debug