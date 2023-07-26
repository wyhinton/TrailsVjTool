var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var imageArray = [];
var WIDTH = 1920;
var HEIGHT = 1080;
var myShader = undefined;
var secondShader = undefined;
var myScreen = undefined;
var micInput = undefined;
var amplitude = undefined;
var copyLayer = undefined;
var threshSlider = undefined;
var imageSetSlider = undefined;
var clearButton = undefined;
var USE_MIC_OPACITY = true;
var ActionValues = (function () {
    function ActionValues() {
        this.actionValuesMap = {
            "action1": {
                active: true,
                default: 0,
                min: 0,
                max: 1,
                onUpdate: function (el, v, t) {
                    el.value(v - .01);
                }
            }
        };
    }
    ActionValues.prototype.addActionSliders = function () {
        var _this = this;
        var keys = Object.keys(this.actionValuesMap);
        keys.map(function (k, i) {
            var group = createDiv('');
            group.position(10, (i * 20) + 500);
            group.id("".concat(k));
            var actionSettings = _this.actionValuesMap[k];
            var newSlider = createSlider(actionSettings.min, actionSettings.max, actionSettings.default, (actionSettings.max - actionSettings.min) / 100);
            newSlider.parent(group);
            var newLabel = createSpan(k);
            newLabel.parent(group);
            var valueDisp = createSpan(actionSettings.default.toString());
            valueDisp.parent(group);
            valueDisp.addClass("valueDisp");
            newSlider.input(function (v) {
                valueDisp.html(v.target.value);
                if (actionSettings.onInput) {
                    actionSettings.onInput(v);
                }
            });
            _this.actionValuesMap[k].slider = newSlider;
        });
        console.log(this.actionValuesMap);
    };
    ActionValues.prototype.setAction = function (name, mode, value) {
        var action = this.actionValuesMap[name];
        action.slider.value(value);
    };
    ActionValues.prototype.updateActions = function (time) {
        var _this = this;
        var keys = Object.keys(this.actionValuesMap);
        keys.forEach(function (k) {
            var action = _this.actionValuesMap[k];
            action.onUpdate(action.slider, action.slider.value(), time);
        });
    };
    return ActionValues;
}());
var AppUtils = (function () {
    function AppUtils() {
        this.sliders = {
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
            micGain: {
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
            imageSet: {
                min: 0,
                max: Object.keys(new ImageUtils().imagesMap).length,
                default: 0,
                onInput: function (event) {
                }
            }
        };
        this.checkBoxes = {
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
            threshFromMic: {
                default: false
            }
        };
        this.UI_SPACING = 20;
    }
    AppUtils.prototype.addSliders = function (sliders) {
        var _this = this;
        var keys = Object.keys(sliders);
        keys.map(function (k, i) {
            var group = createDiv('');
            group.position(10, i * _this.UI_SPACING);
            var sliderSettings = sliders[k];
            var newSlider = createSlider(sliderSettings.min, sliderSettings.max, sliderSettings.default, (sliderSettings.max - sliderSettings.min) / 100);
            newSlider.parent(group);
            var newLabel = createSpan(k);
            newLabel.parent(group);
            var valueDisp = createSpan(sliderSettings.default.toString());
            valueDisp.parent(group);
            valueDisp.addClass("valueDisp");
            newSlider.input(function (v) {
                valueDisp.html(v.target.value);
                if (sliderSettings.onInput) {
                    sliderSettings.onInput(v);
                }
            });
            _this.sliders[k].slider = newSlider;
        });
    };
    AppUtils.prototype.addCheckBoxes = function () {
        var _this = this;
        var keys = Object.keys(this.checkBoxes);
        keys.map(function (k, i) {
            var group = createDiv('');
            var sliderAmount = Object.keys(_this.sliders).length * _this.UI_SPACING;
            var yPos = sliderAmount + _this.UI_SPACING * i;
            var checkBoxSettings = _this.checkBoxes[k];
            var newBox = createCheckbox(k, checkBoxSettings.default);
            _this.checkBoxes[k].checkbox = newBox;
            newBox.position(10, yPos);
        });
        console.log(this.checkBoxes);
    };
    AppUtils.prototype.setShaderUniformSlider = function (shader, uniform, sliderName) {
        shader.setUniform(uniform, this.sliders[sliderName].slider.value());
    };
    AppUtils.prototype.setShaderUniformCheckbox = function (shader, uniform, checkboxName) {
        var val = this.checkBoxes[checkboxName].checkbox.checked();
        shader.setUniform(uniform, val);
    };
    AppUtils.prototype.getSlider = function (sliderName) {
        return this.sliders[sliderName].slider.value();
    };
    AppUtils.prototype.loadCustomShader = function (shaderName) {
        return loadShader("shaders/".concat(shaderName, "/").concat(shaderName, ".vert"), "shaders/".concat(shaderName, "/").concat(shaderName, ".frag"));
    };
    AppUtils.prototype.addClearButton = function () {
        clearButton = createButton('Clear');
        clearButton.position(windowWidth - 50, 50);
        clearButton.mousePressed(function (e) {
            background(0);
        });
    };
    AppUtils.prototype.setSliderOnChange = function (sliderName, handler) {
        this.sliders[sliderName].slider.input(function (e) {
            handler(e);
        });
    };
    return AppUtils;
}());
var ImageUtils = (function () {
    function ImageUtils(appUtils) {
        this.imagesMap = {
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
            "cracks": {
                imageSetType: "overlay",
                images: [],
                resizeAmount: 1,
                limit: 2,
                id: "cracks"
            },
            "heads": {
                imageSetType: "main",
                images: [],
                resizeAmount: .6,
                onSelect: function (imageGroup) {
                    console.log("SELECTED");
                },
                id: "heads"
            },
            "coralwhite": {
                imageSetType: "main",
                images: [],
                resizeAmount: .5,
                id: "coralwhite",
                limit: 7,
            },
            "darkcoral": {
                imageSetType: "main",
                images: [],
                resizeAmount: 1,
                id: "darkcoral",
                limit: 6,
            },
            "axe": {
                imageSetType: "main",
                images: [],
                resizeAmount: 1,
                id: "axe",
                limit: 4,
            },
            "vertebre": {
                imageSetType: "main",
                images: [],
                resizeAmount: 1,
                id: "axe",
                limit: 8,
            },
            "turas": {
                imageSetType: "main",
                images: [],
                resizeAmount: 1,
                id: "turas",
                limit: 4,
            },
            "fishJawBottom": {
                imageSetType: "main",
                images: [],
                resizeAmount: .6,
                id: "fishJawBottom",
                limit: 8,
            },
            "rustysword": {
                imageSetType: "main",
                images: [],
                resizeAmount: 1,
                id: "rustysword",
                limit: 6,
            },
            "orangeflowers": {
                imageSetType: "main",
                images: [],
                resizeAmount: 1,
                id: "orangeflowers",
                limit: 6,
            },
            "fence": {
                imageSetType: "main",
                images: [],
                resizeAmount: 1,
                id: "fence",
                limit: 6,
            },
            "yellowWhiteFlowers": {
                imageSetType: "main",
                images: [],
                resizeAmount: 1.5,
                id: "fence",
                limit: 10,
            },
            "earring": {
                imageSetType: "main",
                images: [],
                resizeAmount: 1.5,
                id: "earring",
                limit: 7,
            },
            "secondSkull": {
                imageSetType: "main",
                images: [],
                resizeAmount: 1.5,
                id: "secondSkull",
                limit: 5,
            },
            "brokenMask": {
                imageSetType: "main",
                images: [],
                resizeAmount: 1.5,
                id: "brokenMask",
                limit: 5,
            },
            "angelTrumpetOne": {
                imageSetType: "main",
                images: [],
                resizeAmount: 1.5,
                id: "angelTrumpetOne",
                limit: 8,
            }
        };
        this.activeGroup = this.imagesMap[Object.keys(this.imagesMap)[0]];
        this.appUtils = appUtils;
    }
    ImageUtils.prototype.buildDir = function () {
        var _this = this;
        var keys = Object.keys(this.imagesMap);
        keys.forEach(function (k) {
            var imgGroupSettings = _this.imagesMap[k];
            var _a = __assign({}, imgGroupSettings), resizeAmount = _a.resizeAmount, limit = _a.limit;
            var numToLoad = limit ? limit : 5;
            for (var index = 0; index < numToLoad; index++) {
                var imgPath = "imageSets/".concat(k, "/").concat(k).concat(index + 1, ".png");
                var newImg = loadImage(imgPath, function (img) {
                    img.resize(img.width / resizeAmount, img.height / resizeAmount);
                    _this.imagesMap[k].images.push(img);
                }, function () { });
            }
        });
        console.log(this.imagesMap);
        return this.imagesMap;
    };
    ImageUtils.prototype.getDir = function (dirInd) {
        var keys = Object.keys(this.imagesMap);
        var ind = Math.floor(Math.min(keys.length - 1, dirInd));
        var groupName = Object.keys(this.imagesMap)[ind];
        var groupToGet = this.imagesMap[groupName];
        if (groupToGet.onSelect) {
            groupToGet.onSelect(groupToGet);
        }
        return this.imagesMap[groupName];
    };
    ImageUtils.prototype.setActiveGroup = function (dirInd) {
        var keys = Object.keys(this.imagesMap);
        var ind = Math.floor(Math.min(keys.length - 1, dirInd));
        var newKey = keys[ind];
        if (this.activeGroup.id !== newKey) {
            var newGroup = this.imagesMap[newKey];
            if (newGroup.onSelect) {
                newGroup.onSelect(newGroup);
            }
        }
        this.activeGroup = this.imagesMap[keys[ind]];
    };
    return ImageUtils;
}());
var MidiUtils = (function () {
    function MidiUtils(actions, appUtils, imageUtils) {
        var _this = this;
        this.midiInputsMap = {
            inputs: {
                "IAC Driver OUT_FOR_QLC": {
                    events: { "noteon": function (e) {
                        }
                    },
                    active: true
                },
                "SPD-1E": {
                    events: {
                        "noteon": function (e) {
                            console.log(e);
                            _this.actions.setAction("action1", "set", 10);
                        },
                        "controlchange": function (e) {
                            var mappedValue = map(e.data[2], 0, 127, 0, Object.keys(new ImageUtils().imagesMap).length);
                            _this.imageUtils.setActiveGroup(mappedValue);
                        }
                    },
                    active: true
                }
            }
        };
        this.actions = actions;
        this.imageUtils = imageUtils;
    }
    MidiUtils.prototype.startMidi = function () {
        var _this = this;
        WebMidi.enable(function () {
        });
        WebMidi.inputs.forEach(function (i) { return i.removeListener(); });
        console.log(WebMidi.outputs);
        setTimeout(function () {
            _this.buildListeners();
        }, 1000);
    };
    MidiUtils.prototype.buildListeners = function () {
        var _this = this;
        console.log(this.midiInputsMap);
        var inputKeys = Object.keys(this.midiInputsMap.inputs);
        console.log(WebMidi.inputs);
        inputKeys.forEach(function (key) {
            var target = WebMidi.inputs.find(function (i) { return i.name === key; });
            var inputSettings = _this.midiInputsMap.inputs[key];
            var eventKeys = Object.keys(inputSettings.events);
            eventKeys.forEach(function (ek) {
                var handlerSettings = inputSettings.events[ek];
                console.log(handlerSettings);
                target.addListener(ek, "all", function (e) {
                    handlerSettings(e);
                });
            });
            console.log(target);
        });
    };
    return MidiUtils;
}());
var Utils = new AppUtils();
var ImgUtils = new ImageUtils(Utils);
var Actions = new ActionValues();
var Midi = new MidiUtils(Actions, Utils, ImgUtils);
var testVid = undefined;
function preload() {
    ImgUtils.buildDir();
    myShader = Utils.loadCustomShader("saturation");
    secondShader = loadShader('shaders/fade/fade.vert', 'shaders/fade/fade.frag');
    testVid.loop();
}
function setup() {
    var z = createCanvas(windowWidth, windowHeight);
    myScreen = createGraphics(windowWidth, windowHeight);
    copyLayer = createGraphics(windowWidth, windowHeight, WEBGL);
    micInput = new p5.AudioIn(function () {
        console.error("MIC FAILED");
    });
    Utils.addSliders(Utils.sliders);
    Utils.addCheckBoxes();
    Utils.addClearButton();
    Midi.startMidi();
    Actions.addActionSliders();
    micInput.start();
    Utils.setSliderOnChange("imageSet", function (e) { ImgUtils.setActiveGroup(e.target.value); });
    amplitude = new p5.Amplitude();
    copyLayer.shader(myShader);
}
var angle = 0;
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function draw() {
    var level = micInput.getLevel() * Utils.getSlider("micGain");
    copyLayer.shader(myShader);
    fill(0);
    var frameInd = play(ImgUtils.activeGroup.images, frameCount);
    var imageToDraw = ImgUtils.activeGroup.images[frameInd];
    var sinTime = Math.sin(frameCount * .01);
    var imgWidth = imageToDraw.width;
    var imgHeight = imageToDraw.height;
    var modSize = false;
    if (modSize) {
        imgWidth *= sinTime;
        imgHeight *= imgHeight;
    }
    var x = width / 2 - imgWidth / 2;
    var y = height / 2 - imgHeight / 2;
    translate(0, sinTime * 100);
    var d = splatterRandom(1, imageToDraw);
    d.map(function (d) {
        if (frameCount % 10 == 0) {
            myScreen.image(d.image, d.x, d.y);
        }
    });
    myScreen.image(imageToDraw, x, y, imgWidth, imgHeight);
    Utils.setShaderUniformSlider(myShader, "threshold", "threshSlider");
    var targetColor = [
        Utils.sliders.rSlider.slider.value(),
        Utils.sliders.gSlider.slider.value(),
        Utils.sliders.bSlider.slider.value()
    ];
    textSize(25);
    myShader.setUniform("tex0", myScreen);
    myShader.setUniform("time", frameCount);
    myShader.setUniform("micInput", level);
    Utils.setShaderUniformSlider(myShader, "targetColorR", "rSlider");
    myShader.setUniform("mirror", false);
    Utils.setShaderUniformSlider(myShader, "jitterAmount", "jitterAmount");
    Utils.setShaderUniformCheckbox(myShader, "useMicOpacity", "useMicOpacity");
    Utils.setShaderUniformCheckbox(myShader, "warp", "warp");
    Utils.setShaderUniformCheckbox(myShader, "ripple", "ripple");
    Utils.setShaderUniformCheckbox(myShader, "mirror", "mirror");
    Utils.setShaderUniformCheckbox(myShader, "fractal", "fractal");
    Utils.setShaderUniformSlider(myShader, "rippleScale", "rippleScale");
    Utils.setShaderUniformCheckbox(myShader, "rotate", "rotate");
    Utils.setShaderUniformCheckbox(myShader, "threshFromMic", "threshFromMic");
    myShader.setUniform("rippleScale", Actions.actionValuesMap["action1"].slider.value());
    copyLayer.rect(0, 0, width, height);
    image(copyLayer, 0, 0, width, height);
    Actions.updateActions(frameCount);
}
function play(images, time) {
    return playForward(images, time);
}
var splatterRandom = function (amount, image) {
    var draws = [];
    for (var index = 0; index < amount; index++) {
        var copy_1 = image.get();
        var minscale = .1;
        var maxscale = .5;
        var scale_1 = random(minscale, maxscale);
        copy_1.resize(copy_1.width * scale_1, copy_1.height * scale_1);
        var x = random(window.innerWidth - copy_1.width);
        var y = random(window.innerHeight - copy_1.height);
        draws.push({ image: copy_1, x: x, y: y });
    }
    return draws;
};
function playForward(images, time) {
    var length = 20;
    var ind = Math.floor(time / length) % images.length;
    return ind;
    image(images[ind], 0, 0);
}
function drawGraph(graphics, yValues) {
    var startX = 50;
    var endX = width - 50;
    var startY = height / 2;
    var endY = height - 50;
    graphics.line(startX, startY, endX, startY);
    graphics.line(startX, startY, startX, endY);
    graphics.stroke(255);
    graphics.noFill();
    graphics.beginShape();
    for (var i = 0; i < yValues.length; i++) {
        var x = map(i, 0, yValues.length - 1, startX, endX);
        var y = map(yValues[i], -1, 1, startY, endY);
        graphics.vertex(x, y);
    }
    graphics.endShape();
    if (yValues.length > (endX - startX)) {
        yValues.shift();
    }
}
function drawCentered(image) {
    var x = width / 2 - image.width / 2;
    var y = height / 2 - image.height / 2;
}
function centerCanvas() {
    var x = (windowWidth - width) / 2;
    var y = (windowHeight - height) / 2;
    return { x: x, y: y };
}
var MidiEventType;
(function (MidiEventType) {
    MidiEventType["NoteOn"] = "noteon";
    MidiEventType["NoteOff"] = "noteoff";
    MidiEventType["ControlChange"] = "controlchange";
    MidiEventType["MidiMessage"] = "midimessage";
    MidiEventType["PitchBend"] = "pitchbend";
    MidiEventType["ProgramChange"] = "programchange";
    MidiEventType["Start"] = "start";
    MidiEventType["Stop"] = "stop";
    MidiEventType["Continue"] = "continue";
    MidiEventType["Reset"] = "reset";
})(MidiEventType || (MidiEventType = {}));
//# sourceMappingURL=build.js.map