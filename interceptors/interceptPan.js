var shadowDOMElement;
var canvasLocation ='';
var maxFreq = 1000;
var minFreq = 250;
var currFreq, currVol, currPan;
var xPosDiff=0, yPosDiff=0;

//for object in setpu (??)
funcNames = refData["classitems"].map(function(x){
  return {
    name: x["name"],
    params: x["params"],
    class: x["class"],
    module: x["module"],
    submodule: x["submodule"]
  };
});

// create web audio api context
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// create Oscillator node
var oscillatorNode = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();
var panNode = audioCtx.createStereoPanner();

funcNames = funcNames.filter(function(x) {
  var className = x["class"];
  return (x["name"] && x["params"] && (className==='p5'));
})

// create web audio api context
console.log('testing sound');

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

funcNames.forEach(function(x){
  var originalFunc = p5.prototype[x.name];
  p5.prototype[x.name] = function(){
    orgArg = arguments;

    // set up all the initial values
    if(frameCount == 1 && x.module=='Shape') {
      for(var i =0; i < x.params.length; i++) {
        if(x.params[i].description.indexOf('x-coordinate')>-1){
          xPosPrev = arguments[i];
          xPosCurr = arguments[i];
        }
        if(x.params[i].description.indexOf('y-coordinate')>-1){
          yPosPrev = arguments[i];
          yPosCurr = arguments[i];
        }
      }
    }

    // Pull out only the shapes in draw()
    else if(frameCount > 1 && (frameCount%1 == 0) && x.module=='Shape') {
      //pull out only the x coord values and compare with prev value
      for(var i =0; i < x.params.length; i++) {
        if(x.params[i].description.indexOf('x-coordinate')>-1){
          // console.log('in here');
          xPosCurr = arguments[i];
          xPosDiff = xPosCurr - xPosPrev;
          xPosPrev = xPosCurr;
        }
        if(x.params[i].description.indexOf('y-coordinate')>-1){
          yPosCurr = arguments[i];
          yPosDiff = yPosCurr - yPosPrev;
          yPosPrev = yPosCurr;
        }
        if(abs(xPosDiff>0)||abs(yPosDiff>0))
        {
          currNote = (1-yPosCurr/height)*(12); // mapping hieghts to notes from 1-100
          //fn = f0 * (a)n
          currLogFreq = 440 * Math.pow(Math.pow(2,(1/12)),currNote);
          currVol = 0.4;
          console.log(frameCount%12);
          x_coord = frameCount%12 - 6;
          currVol = 1*Math.exp(-(x_coord*x_coord));
          console.log(currVol);
          currPan = (xPosCurr/width)*2 - 1;
          oscillatorNode.frequency.value = currLogFreq;
          gainNode.gain.value = currVol;
          panNode.pan.value = currPan;
        }
      }
    }
    return originalFunc.apply(this,arguments);
  }
});

/*** PSUEDO CODE - for a simple version. Only one object
* Since we are looking at movement. Can run only in draw ?
* Take note of position of the object
* Check if the position is changing. If yes -
  *see what the delta is
***/

window.onload = function() {
  console.log('test test');
  oscillatorNode.type = 'sine';
  oscillatorNode.frequency.value = 440; // value in hertz
  oscillatorNode.start();
  oscillatorNode.connect(gainNode);
  gainNode.connect(panNode);
  panNode.connect(audioCtx.destination);
  gainNode.gain.value = 0;
}
