/// <reference types="popmotion" />




// let numberOfShapesControl: p5.Element;
const imageArray: p5.Image[] = []
const WIDTH = 1920
const HEIGHT = 1080
let myShader: p5.Shader = undefined;
let secondShader: p5.Shader = undefined;
let myScreen: p5.Graphics = undefined;
let micInput: p5.AudioIn = undefined;
let amplitude: p5.Amplitude = undefined;
let copyLayer: p5.Graphics = undefined;
let threshSlider: p5.Element = undefined;
let imageSetSlider: p5.Element = undefined;
let clearButton: p5.Element = undefined;
const USE_MIC_OPACITY = true;

// declare module "z"{
//   const c = require("webmidi")
// }

interface ActionValueSettings{
  active: boolean;
  min: number;
  max: number;
  default: number;
  onUpdate: onUpdateAction;
  slider?: p5.Element;
}

type onUpdateAction = (el: p5.Element, value: number, time: number)=>void

interface ActionValueMap{
  [key: string]: ActionValueSettings
}

type ActionUpdateMode = "static"|"fall"
class ActionValues {
  actionValuesMap = {
    "action1": {
      active: true,
      default: 0,
      min: 0,
      max: 1,
      onUpdate: (el, v, t)=>{
        // console.log("updating")
        el.value(v-.01)
        // console.log(el.value())
      }
    }
  } as ActionValueMap
  constructor() {
    
  }
  addActionSliders(){
    const keys = Object.keys(this.actionValuesMap)
    keys.map((k, i)=>{
      let group = createDiv('');
      group.position(10, (i*20)+500)
      group.id(`${k}`)
      const actionSettings = this.actionValuesMap[k];
      const newSlider = createSlider(actionSettings.min, actionSettings.max, actionSettings.default, (actionSettings.max- actionSettings.min)/100)
      newSlider.parent(group)

      let newLabel = createSpan(k)
      newLabel.parent(group)
      let valueDisp = createSpan(actionSettings.default.toString())
      valueDisp.parent(group)
      valueDisp.addClass("valueDisp")
      newSlider.input((v)=>{
        valueDisp.html(v.target.value)
        if (actionSettings.onInput){
          actionSettings.onInput(v)
        }
      })
      this.actionValuesMap[k].slider = newSlider
      // let sketchNew = function(p) {
      //   let canv = undefined
      //   let yValues: number[] = []
      //   p.setup = function(){
      //     canv = p.createCanvas(400, 300);
      //     p.background(255);
       
      //   }
      //   p.draw = (p)=>{
      //     console.log(frameCount)
      //     console.log(p)
      //     let yg = sin(frameCount);
      //     yValues.push(yg)
      //     drawGraph(canv, yValues)
      //   }
      // };
      // let node = document.createElement('div');
      // new p5(sketchNew, node);
      // window.document.getElementById(k).appendChild(node)
    })
    console.log(this.actionValuesMap)
  }
  setAction(name: string, mode: "set"|"animate", value: number){
    const action = this.actionValuesMap[name]
    action.slider.value(value)
  }

  updateActions(time: number){
    const keys = Object.keys(this.actionValuesMap)
    keys.forEach(k => {
      const action = this.actionValuesMap[k]
      action.onUpdate(action.slider, action.slider.value() as number, time )
    });
  }


}
class AppUtils {
  sliders = {
   threshSlider: {
     min: 0, 
     max: 1,
     default: .5
   }, 
   rSlider: {
     min: 0, 
     max: 1,
     default: .5,
   },
   gSlider: {
     min: 0, 
     max: 1,
     default: .5,
   },
   bSlider: {
     min: 0, 
     max: 1,
     default: .5,
   },
   micGain:{
     min: .1,
     max: 20,
     default: 1,
   },
   jitterAmount: {
     min: 0,
     max: 1,
     default: 0,
   },
   rippleScale: {
    min: 0,
    max: 1,
    default: .03,
  },
   imageSet:{
    min: 0,
    max: Object.keys(new ImageUtils().imagesMap).length,
    default: 0,
    onInput: (event)=>{
      // console.log(event.target.value)
      // this.act
      // activeImageSet = event.target.value
    }
   }
 } as SliderMap

 checkBoxes = {
  useMicOpacity: {
    default: USE_MIC_OPACITY  
  },
  ripple: {
    default: true,  
  },
  warp: {
    default: false,
  },
  mirror: {
    default: false,
  },
  rotate: {
    default: false,
  },
  fractal: {
    default: false,
  },
  threshFromMic:{
    default: false
  }
 } as CheckBoxMap

 UI_SPACING = 20;
 constructor() {
   
 }
  addSliders(sliders: SliderMap){
    const keys = Object.keys(sliders)
    keys.map((k, i)=>{
      let group = createDiv('');
      group.position(10, i*this.UI_SPACING)
      const sliderSettings = sliders[k];
      const newSlider = createSlider(sliderSettings.min, sliderSettings.max, sliderSettings.default, (sliderSettings.max- sliderSettings.min)/100)
      newSlider.parent(group)
      let newLabel = createSpan(k)
      newLabel.parent(group)
      let valueDisp = createSpan(sliderSettings.default.toString())
      valueDisp.parent(group)
      valueDisp.addClass("valueDisp")
      newSlider.input((v)=>{
        valueDisp.html(v.target.value)
        if (sliderSettings.onInput){
          sliderSettings.onInput(v)
        }
      })
      this.sliders[k].slider = newSlider
    })
  }

  addCheckBoxes(){
    const keys = Object.keys(this.checkBoxes)
    keys.map((k, i)=>{
      let group = createDiv('');
      let sliderAmount = Object.keys(this.sliders).length*this.UI_SPACING;
      let yPos = sliderAmount + this.UI_SPACING*i
      const checkBoxSettings = this.checkBoxes[k];
      const newBox = createCheckbox(k, checkBoxSettings.default)
      this.checkBoxes[k].checkbox = newBox;
      newBox.position(10, yPos)
    })
    console.log(this.checkBoxes)
  }

  setShaderUniformSlider(shader: p5.Shader, uniform: string, sliderName: string){
    shader.setUniform(uniform, this.sliders[sliderName].slider.value() as number)
  }
  
  setShaderUniformCheckbox(shader: p5.Shader, uniform: string, checkboxName: string){
    const val = this.checkBoxes[checkboxName].checkbox.checked() as boolean
    // console.log(val)
    shader.setUniform(uniform, val)
  }


  getSlider(sliderName: string): number{
    return this.sliders[sliderName].slider.value() as number
  }

  loadCustomShader(shaderName: string){
    return loadShader(`shaders/${shaderName}/${shaderName}.vert`, `shaders/${shaderName}/${shaderName}.frag`);
  }

  addClearButton(){
    clearButton = createButton('Clear');
    clearButton.position(windowWidth-50, 50);
    clearButton.mousePressed((e)=>{
      background(0)
    });
  }
  
  setSliderOnChange(sliderName: string, handler: (e: InputEvent)=>void){
    this.sliders[sliderName].slider.input(e=>{
        handler(e)
    })
  }
}

class ImageUtils {
   
   imagesMap: ImageDir = {
    "tree": {
      imageSetType: "main",
      images: [],
      resizeAmount: 1,
      id: "tree",
    },
    "skull": {
      imageSetType: "main",
      images: [],
      resizeAmount: 1,
      id: "skull",
    },
    "cracks":{
      imageSetType: "overlay",
      images:[],
      resizeAmount: 1,
      limit: 2,
      id: "cracks"
    }, 
    "heads":{
      imageSetType: "main",
      images: [],
      resizeAmount: .6,
      onSelect: (imageGroup)=>{
        console.log("SELECTED")
      },
      id: "heads"
    },
    "coralwhite":{
      imageSetType: "main",
      images: [],
      resizeAmount: .5,
      // onSelect: (imageGroup)=>{
      //   console.log("SELECTED")
      // },
      id: "coralwhite",
      limit: 7,
    },
    "darkcoral":{
      imageSetType: "main",
      images: [],
      resizeAmount: 1,
      // onSelect: (imageGroup)=>{
      //   console.log("SELECTED")
      // },
      id: "darkcoral",
      limit: 6,
    },
    "axe":{
      imageSetType: "main",
      images: [],
      resizeAmount: 1,
      // onSelect: (imageGroup)=>{
      //   console.log("SELECTED")
      // },
      id: "axe",
      limit: 4,
    },
    "vertebre":{
      imageSetType: "main",
      images: [],
      resizeAmount: 1,
      // onSelect: (imageGroup)=>{
      //   console.log("SELECTED")
      // },
      id: "axe",
      limit: 8,
    },
    "turas":{
      imageSetType: "main",
      images: [],
      resizeAmount: 1,
      // onSelect: (imageGroup)=>{
      //   console.log("SELECTED")
      // },
      id: "turas",
      limit: 4,
    },
    "fishJawBottom":{
      imageSetType: "main",
      images: [],
      resizeAmount: .6,
      // onSelect: (imageGroup)=>{
      //   console.log("SELECTED")
      // },
      id: "fishJawBottom",
      limit: 8,
    },
    "rustysword":{
      imageSetType: "main",
      images: [],
      resizeAmount: 1,
      // onSelect: (imageGroup)=>{
      //   console.log("SELECTED")
      // },
      id: "rustysword",
      limit: 6,
    },
    "orangeflowers":{
      imageSetType: "main",
      images: [],
      resizeAmount: 1,
      // onSelect: (imageGroup)=>{
      //   console.log("SELECTED")
      // },
      id: "orangeflowers",
      limit: 6,
    },
    "fence":{
      imageSetType: "main",
      images: [],
      resizeAmount: 1,
      // onSelect: (imageGroup)=>{
      //   console.log("SELECTED")
      // },
      id: "fence",
      limit: 6,
    },
    "yellowWhiteFlowers":{
      imageSetType: "main",
      images: [],
      resizeAmount: 1.5,
      // onSelect: (imageGroup)=>{
      //   console.log("SELECTED")
      // },
      id: "fence",
      limit: 10,
    },
    "earring":{
      imageSetType: "main",
      images: [],
      resizeAmount: 1.5,
      // onSelect: (imageGroup)=>{
      //   console.log("SELECTED")
      // },
      id: "earring",
      limit: 7,
    },
    "secondSkull":{
      imageSetType: "main",
      images: [],
      resizeAmount: 1.5,
      // onSelect: (imageGroup)=>{
      //   console.log("SELECTED")
      // },
      id: "secondSkull",
      limit: 5,
    },
    "brokenMask":{
      imageSetType: "main",
      images: [],
      resizeAmount: 1.5,
      // onSelect: (imageGroup)=>{
      //   console.log("SELECTED")
      // },
      id: "brokenMask",
      limit: 5,
    },
    "angelTrumpetOne":{
      imageSetType: "main",
      images: [],
      resizeAmount: 1.5,
      // onSelect: (imageGroup)=>{
      //   console.log("SELECTED")
      // },
      id: "angelTrumpetOne",
      limit: 8,
    }
}
  activeGroup = this.imagesMap[Object.keys(this.imagesMap)[0]]
  appUtils: AppUtils;
  constructor(appUtils: AppUtils) {
      this.appUtils = appUtils
  }
  buildDir(): ImageDir{
    const keys = Object.keys(this.imagesMap)
    keys.forEach(k => {
      const imgGroupSettings = this.imagesMap[k];
      const {resizeAmount, limit} = {...imgGroupSettings}
      const numToLoad = limit?limit:5;
      for (let index = 0; index < numToLoad; index++) {
          
          const imgPath = `imageSets/${k}/${k}${index+1}.png`;
          // console.log(imgPath)
          const newImg = loadImage(imgPath, (img)=>{
            img.resize(img.width/resizeAmount, img.height/resizeAmount)
            this.imagesMap[k].images.push(img)
            // addProcess
            //set loader

          }, ()=>{})
      }
    });
    console.log(this.imagesMap)
    return this.imagesMap
  }
  getDir(dirInd: number): ImageGroup{
    const keys = Object.keys(this.imagesMap)
    const ind = Math.floor(Math.min(keys.length-1, dirInd))
    const groupName = Object.keys(this.imagesMap)[ind]
    const groupToGet = this.imagesMap[groupName]
    if (groupToGet.onSelect){
      groupToGet.onSelect(groupToGet)
    }
    return this.imagesMap[groupName]
    // return Object.keys(this.imagesMap)[dirInd].images
  }

  setActiveGroup(dirInd: number): void{
    const keys = Object.keys(this.imagesMap)
    const ind = Math.floor(Math.min(keys.length-1, dirInd))
    const newKey = keys[ind]
    if (this.activeGroup.id !== newKey){
      const newGroup = this.imagesMap[newKey]
      if (newGroup.onSelect){
        newGroup.onSelect(newGroup)
      }
      
    }
    this.activeGroup = this.imagesMap[keys[ind]]
  }



}

class MidiUtils {
  actions: ActionValues
  imageUtils: ImageUtils
  constructor(actions: ActionValues, appUtils: AppUtils, imageUtils: ImageUtils) {
    this.actions = actions
    this.imageUtils = imageUtils
  }
  
  midiInputsMap = {
    inputs: {
      "IAC Driver OUT_FOR_QLC": 
      {
        events: {"noteon": (e)=>{
          // console.log(e)
        }
        },
        active: true
      },
      "SPD-1E":{
        events: {
          "noteon": (e)=>{
            console.log(e)
            this.actions.setAction("action1", "set", 10)
          },
          "controlchange": (e)=>{
            // console.log(e)
            const mappedValue = map(e.data[2], 0, 127, 0, Object.keys(new ImageUtils().imagesMap).length)
            this.imageUtils.setActiveGroup(mappedValue)
            // console.log(mappedValue)
            
          }
        },
        active: true
      }
    }
  } as MidiInputMap

  startMidi(){
    // console.log(Wm.WebMidi)
    WebMidi.enable(()=>{

    })
    WebMidi.inputs.forEach(i => i.removeListener());
    console.log(WebMidi.outputs)

    // WebMidi.
    setTimeout(() => {
      this.buildListeners()
    
    }, 1000);
  
  }

  buildListeners(){
    console.log(this.midiInputsMap)
    const inputKeys = Object.keys(this.midiInputsMap.inputs)
    console.log(WebMidi.inputs)
    inputKeys.forEach(key => {
      const target = WebMidi.inputs.find(i=>i.name === key)
      const inputSettings = this.midiInputsMap.inputs[key]
      const eventKeys = Object.keys(inputSettings.events)
      eventKeys.forEach(ek => {
        const handlerSettings = inputSettings.events[ek] as MidiEventHanlder
        console.log(handlerSettings)
        target.addListener(ek, "all", e=>{
          handlerSettings(e)
        })
      });
      console.log(target)

    });

  }
}

const Utils = new AppUtils()
const ImgUtils = new ImageUtils(Utils)
const Actions = new ActionValues()
const Midi = new MidiUtils(Actions, Utils, ImgUtils)



let testVid: p5.MediaElement = undefined



function preload(){
  ImgUtils.buildDir()
  myShader = Utils.loadCustomShader("saturation");
  secondShader = loadShader('shaders/fade/fade.vert', 'shaders/fade/fade.frag');
  // testVid = createVideo("videos/skull_video_1.mov");
  testVid.loop()
}
// P5 WILL AUTOMATICALLY USE GLOBAL MODE IF A DRAW() FUNCTION IS DEFINED
function setup() {

  let z = createCanvas(windowWidth, windowHeight)
  myScreen = createGraphics(windowWidth, windowHeight)
  copyLayer = createGraphics(windowWidth, windowHeight, WEBGL);
  micInput = new p5.AudioIn(()=>{
    console.error("MIC FAILED")
  })
  Utils.addSliders(Utils.sliders)
  Utils.addCheckBoxes()
  Utils.addClearButton()
  Midi.startMidi()
  Actions.addActionSliders()
  micInput.start()
  Utils.setSliderOnChange("imageSet", (e)=>{ImgUtils.setActiveGroup(e.target.value)})

  amplitude = new p5.Amplitude();
  // myShader.setUniform('')
  copyLayer.shader(myShader)



  // console.log(Utils.sliders)
}
let angle = 0;
// p5 WILL AUTO RUN THIS FUNCTION IF THE BROWSER WINDOW SIZE CHANGES
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
// p5 WILL HANDLE REQUESTING ANIMATION FRAMES FROM THE BROWSER AND WIL RUN DRAW() EACH ANIMATION FROME
function draw() {
  let level = micInput.getLevel() * Utils.getSlider("micGain");
  copyLayer.shader(myShader)
   // CLEAR BACKGROUND
  // background();

  // CENTER OF SCREEN
  fill(0);
  // console.log(activeImageSet)
  // const dirToDraw = setDir[Object.keys(setDir)[activeImageSet]]
 
  const frameInd = play(ImgUtils.activeGroup.images, frameCount);
  const imageToDraw = ImgUtils.activeGroup.images[frameInd];
  // console.log(imageToDraw)
  let sinTime = Math.sin(frameCount * .01);
  let imgWidth = imageToDraw.width;
  let imgHeight = imageToDraw.height;
  let modSize = false;
  if (modSize){
    imgWidth *= sinTime;
    imgHeight *= imgHeight;
  }
  
  let x = width / 2 - imgWidth/ 2;
  let y = height / 2 - imgHeight / 2;

  // push()
  translate(0, sinTime*100)
  // console.log(imgWidth)
  const d = splatterRandom(1, imageToDraw)
  d.map(d=>{
    // console.log(Math.floor(sinTime*10/level))
    // console.log(math)
    // if (frameCount % Math.floor(sinTime*10/level) == 0){
    // if (frameCount % Math.floor(level) == 0){
      if (frameCount % 10 == 0){
        // d.y += 
       myScreen.image(d.image, d.x, d.y)
    }
    
  })

  
  // myScreen.image(testVid, 0, 0, 1280, 812)
  myScreen.image(imageToDraw, x, y, imgWidth, imgHeight)
  // pop()
  //ROTATE
  // let radius = 100;
  // let x2 = width / 2 * cos(angle);
  // let y2 = height / 2 * sin(angle);
  // push();
  // // Translate to the calculated position
  // translate(x, y);
  
  // // Rotate the image based on the angle
  // rotate(angle);
  
  // // Display the image at the translated and rotated position
  // imageMode(CENTER);
  // image(imageToDraw, 0, 0, 100, 100);
  
  // // Update the angle for the next frame
  // angle += 0.02;
  // imageMode(CENTER);
  // myScreen.image(imageToDraw, x2, y2)
  // pop();
  

  Utils.setShaderUniformSlider(myShader, "threshold", "threshSlider")
  // myShader.setUniform("threshold", sliders.threshSlider.slider.value() as number)
  let targetColor = [
    Utils.sliders.rSlider.slider.value() as number,
     Utils.sliders.gSlider.slider.value() as number,
     Utils.sliders.bSlider.slider.value() as number
    ]
    // console.log(targetColor)

  
  // console.log(level)
  // let z = micInput.get
  textSize(25)
  myShader.setUniform("tex0", myScreen)
  myShader.setUniform("time", frameCount)

  myShader.setUniform("micInput", level);
  Utils.setShaderUniformSlider(myShader, "targetColorR", "rSlider")
  myShader.setUniform("mirror", false);
  Utils.setShaderUniformSlider(myShader, "jitterAmount", "jitterAmount")
  Utils.setShaderUniformCheckbox(myShader, "useMicOpacity", "useMicOpacity")
  Utils.setShaderUniformCheckbox(myShader, "warp", "warp")
  // console.log(level)
  Utils.setShaderUniformCheckbox(myShader, "ripple", "ripple")
  Utils.setShaderUniformCheckbox(myShader, "mirror", "mirror")
  Utils.setShaderUniformCheckbox(myShader, "fractal", "fractal")
  Utils.setShaderUniformSlider(myShader, "rippleScale", "rippleScale")
  Utils.setShaderUniformCheckbox(myShader, "rotate", "rotate");
  Utils.setShaderUniformCheckbox(myShader, "threshFromMic", "threshFromMic");
  // Actions.
  myShader.setUniform("rippleScale", Actions.actionValuesMap["action1"].slider.value() as number)
  copyLayer.rect(0,0,width, height);
  // rect0,0,width, height);
  image(copyLayer, 0,0, width, height);
  Actions.updateActions(frameCount)  


  // Push the y-value into the array

  // Draw the graph

  // Update time
  // time += 0.1;

 
}

function play(images: p5.Image[], time: number): number {
  
  return playForward(images, time)
}

const splatterRandom = (amount: number, image: p5.Image): ImageDraw[] => {

  let draws = []
  for (let index = 0; index < amount; index++) {
    const copy = image.get()
    let minscale = .1;
    let maxscale = .5;
    let scale = random(minscale, maxscale);
    copy.resize(copy.width*scale, copy.height*scale)
    let x = random(window.innerWidth - copy.width);
    let y = random(window.innerHeight - copy.height);
    draws.push({image: copy, x, y})
  }
  return draws
}

function playForward(images: p5.Image[], time: number): number{
  const length = 20;
  const ind = Math.floor(time/length) % images.length;
  return ind
  image(images[ind], 0, 0)
  // for (let index = 0; index < imageArray.length; index++) {
  //   const element = imageArray[index];
  //   const z = "z";
  //   // image(img, 0, 0)
  //   if ()
  //   image(element, 0, 0)
  // }
}


function drawGraph(graphics: p5.Graphics, yValues: number[]) {
  // Set up graph parameters
  let startX = 50;
  let endX = width - 50;
  let startY = height / 2;
  let endY = height - 50;
  
  // Draw horizontal and vertical lines
  graphics.line(startX, startY, endX, startY);
  graphics.line(startX, startY, startX, endY);
  
  // Draw graph points and lines
  graphics.stroke(255);
  graphics.noFill();
  // graphics.fill(255, 255, 255)
  graphics.beginShape();
  for (let i = 0; i < yValues.length; i++) {
    let x = map(i, 0, yValues.length - 1, startX, endX);
    let y = map(yValues[i], -1, 1, startY, endY);
    graphics.vertex(x, y);
  }
  graphics.endShape();
  
  // Limit the number of values in the array to keep the graph from getting too long
  if (yValues.length > (endX - startX)) {
    yValues.shift();
  }
}

function drawCentered(image: p5.Image){
  let x = width / 2 - image.width / 2;
  let y = height / 2 - image.height / 2;
  // image(image, x, y)
}

function centerCanvas(): {x: number, y: number} {
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  return {x, y}
} 




type ImageSetType = "main" | "overlay";

type ImageDir = {[key: string]: ImageGroup}

interface ImageGroup{
  images: p5.Image[];
  imageSetType: ImageSetType;
  id: string;
  resizeAmount: number;
  limit?: number;
  onSelect?: ImageGroupSelect;
}

type ImageGroupSelect = (imageGroup: ImageGroup) =>void;

interface ImageDraw{
  image: p5.Image;
  x: number;
  y: number;
}


interface SliderSettings{
  min: number; 
  max: number;
  default: number;
  slider?: p5.Element;
  onInput?: (event: InputEvent)=>void;
}

interface SliderMap{
  [key: string]: SliderSettings
}

interface CheckBoxSettings{
  default: boolean;
  checkbox?: p5.Element;
}

interface CheckBoxMap{
  [key: string]: CheckBoxSettings
}

interface MidiEvent{
  data: number[];
  timestamp: number
  type: MidiEventType
}
type MidiEventHanlder = (e: MidiEvent)=>void

type MidiInputHandler = {
  [key in MidiEventType]? : MidiEventHanlder
}

interface MidiInputSettings{
  events: MidiInputHandler,
  active: boolean; 
}

interface MidiInputMap{
  inputs: {[key: string]: MidiInputSettings}
}

enum MidiEventType {
  NoteOn = 'noteon',
  NoteOff = 'noteoff',
  ControlChange = 'controlchange',
  MidiMessage = 'midimessage',
  PitchBend = 'pitchbend',
  ProgramChange = 'programchange',
  Start = 'start',
  Stop = 'stop',
  Continue = 'continue',
  Reset = 'reset',
}

// type MidiEventType = "noteon"|"noteoff"|"controlchange"|"midimessage"|"pitchbend"|"programchange"|"start"|"stop"|"continue"|"reset"