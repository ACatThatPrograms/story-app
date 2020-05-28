import React from 'react'
// import { mapAllStatesToProps, mapAllDispatchesToProps } from 'redux/helpers/main.js';
// import { connect } from "react-redux";

// Images
import SpacebarImg from 'images/spacebar1.gif';
import ReactJSImg  from 'images/reactjs.png';
import DingImg     from 'images/ding.png';
// Sfx
import textBeep from 'audio/text.mp3';

// Style
import localstyle from './TextBox.module.scss';

// BIG TODO: Fix other TODOs, extrapolate and make its own packag
// TODO:
// 1, Add custom CC support []
// 2. Fix other todos []
// 3. Strip out project specific code for packaging
// 4. Clean up general lingo and comments
// 5. After cleanup, break up and abstract out
// 6. Not sure yet... Think of cool features

const debugPerformance = false;

// Sound setup

var context = new (window.AudioContext || window.webkitAudioContext)();
var soundBuffer = null;
window.AudioContext = window.AudioContext || window.webkitAudioContext;

function loadSound(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      soundBuffer = buffer;
    }, onError);
  }
  request.send();
}

function onError(e) {
  console.log(e)
}

loadSound(textBeep);

function playSound(buffer) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
}

class TextBox extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      "charArray"  : [],    // Array of chars to type
      "charsTyped" : [],    // Initialize to array[] in prepareText()
      "charIndex"  : 0,     // Current char in charArray
      "started"    : false, // Started typing?
      "doneTyping" : false, // Done typing?
    }

    this.speedMulti = 1;

    // Props // TODO: Convert to propTypes
    this.medianCharDelay  = 40;
    this.delayWaver       = 10;
    this.startDelay       = 3000; // TODO: update this for not my needs
    this.customCCs        = [];

    // Timeout list
    this.parseTimeout = null;

    // Performance
    this.lastFramePerf  = 0;
    this.lastPerfE      = 0;
    this.perfStats      = {
      lastFrame     : 0,
      lastPerfMach  : 0,
      iterations    : 0,
      speedMulti    : 1.00,
      plus100s      : 0,
      sub100s       : 0,
    }

    // Other
    this.waitInput  = false;
    this.lockSpace  = true;
    this.timeouts   = [];
    this.speedMulti = 1.00;

    this.pressDown = false;

  }

  /////////////////////////
  /* Performance Logging */
  /////////////////////////
  perfLogging() {
    this.perfStats.lastFrame = performance.now() - this.perfStats.lastPerfMach

    if (this.perfStats.lastFrame > 100) {
      this.perfStats.plus100s += 1
    } else {
      this.perfStats.sub100s += 1
    }

    this.perfStats.speedMulti   = this.speedMulti
    this.perfStats.lastPerfMach = performance.now()
    this.perfStats.iterations  += 1
  }

  /////////////////////////
  /* Mounting && Updates */
  /////////////////////////

  componentDidMount() {
    // console.log("Mount!", this)
    // Subscribe Events
    document.addEventListener("keydown", this.handleKeyDown.bind(this))
    document.addEventListener("keyup", this.handleKeyUp.bind(this))
    // Prepare Text
    this.prepareText(this.props.textToType || "")
  }

  shouldComponentUpdate() {
    if (!this.state.charsTyped.length <= this.state.charArray.length && debugPerformance) {
      console.log(this.perfStats, this.lastFramePerf)
    }
    return this.state.charsTyped.length <= this.state.charArray.length
  }

  componentDidUpdate(prevProps, prevState) {
    //console.log("prev", prevProps, prevState)
    //console.log("cur", this.props, this.state)
    // If charArray changes from prop passing restart textBox
    if (prevState.charArray.length === 0 && this.state.charArray.length > 0) {
      this.prepareText(this.props.textToType, true)
    }
    // Performance logging etc.
    this.perfLogging();
    // Check if typing is done . . .
    this.isTypingDone();
  }

  componentWillUnmount() {
    this.clearTimeouts();
    document.removeEventListener("keydown", this.handleKeyDown.bind(this))
    document.removeEventListener("keyup", this.handleKeyUp.bind(this))
  }

  // Wait timeout for delays
  async wait(time) {
    return new Promise( (res) => {
      this.timeouts.push( setTimeout( () => {res()}, time) )
    })
  }

  clearTimeouts() {
    return new Promise( (res) => {
      for (let timeout of this.timeouts) {
        clearTimeout(timeout)
      }
      res()
    })
  }

  // TODO: Remove project specific turn code here
  async input() {
    // Response to waitInput
    if (this.waitInput) {
      this.waitInput = false;
      this.parseNextChar();
    }
    else if (this.state.doneTyping) {
      this.lockSpace = true;
      this.props.turn()
    } else if (this.speedMulti !== .5){
      this.speedMulti = .5
    }

  }

  isTypingDone() {
    if (this.state.charsTyped !== 0 &&
      this.state.charsTyped.length >= this.state.charArray.length
      && !this.state.doneTyping) {
      this.setState({"doneTyping": true})
    }
  }

  ////////////////
  /* User Input */
  ////////////////
  handleKeyDown(e) {
    if (this.pressDown) { return }
    if (e.code === "Space" && !this.lockSpace ) {
      this.input();
    }
    this.pressDown = true;
  }

  handleKeyUp(e) {
    if (!this.pressDown) { return }
    if (e.code === "Space" ) {
      this.speedMulti = 1.00
    }
    this.pressDown = false;
  }

  //////////////////
  /* Text Parsing */
  //////////////////

  async prepareText(text, reset=false) {
    let charArray = text.split("")
    if (this.startDelay && !reset) { await this.wait(this.startDelay) }
    this.setState({"charArray": charArray, "doneTyping": !reset}, this.parseNextChar)
  }

  // Parse the next char for CC Leaders, default is " [ " ; handle accordingly
  async parseNextChar() {

    // If doneTyping TODO: Add done callbacks for packaging
    if (this.state.doneTyping) { return }

    // If waiting for input, don't do anything
    if (this.waitInput) { return }

    this.lockSpace = false;

    let charDelay = this.getCharDelay()

    await this.wait(charDelay)

    // Check for injected React DOM element
    if (typeof this.state.charArray[this.state.charIndex] === 'object') {
      // Add domElement to typedChars
      let newcharArray = [...this.state.charsTyped]
      newcharArray.push(this.state.charArray[this.state.charIndex])
      playSound(soundBuffer)
      this.setState({"charIndex": this.state.charIndex += 1, "charsTyped": newcharArray}, this.parseNextChar)
    }
    // Check for control codes
    else if (typeof this.state.charArray[this.state.charIndex] !== 'undefined'
            && this.state.charArray[this.state.charIndex].charAt(0) === '['
    ) {

      let ccDetected = await this.handleControlCode()
      this.setState(ccDetected, this.parseNextChar)

    } else {

      // Init an array to modify if no CCs
      let newcharArray = [...this.state.charsTyped]
      // Push new character to type
      newcharArray.push(this.state.charArray[this.state.charIndex])

      // If last character, add one last space to push last character where it belongs
      // This accounts for the css animation class for the entrance character
      if (this.state.charsTyped.length === this.state.charArray.length) {
        newcharArray.push(" ")
      }

      // Only play sfx for chars
      if (this.state.charArray[this.state.charIndex] !== " ") {
        playSound(soundBuffer)
      }

      this.setState({
        "charIndex": this.state.charIndex += 1,
        "charsTyped": newcharArray
      }, this.parseNextChar)

    }

  }

  // Handle CC codes and return state update object
  async handleControlCode() {
    // Parse Control Code Indices, assume it is the first '[' as it hasn't been removed yet
    let ccStart = this.state.charArray.findIndex(e => e === '[')
    let ccEnd   = this.state.charArray.findIndex(e => e === ']')
    let ccLen   = ccEnd - (ccStart-1) //  -1 (+1 to length) to account for index
    // Isolate CC into new cloned array
    let ccRemoved = [...this.state.charArray]
    let cc        = ccRemoved.splice(ccStart, ccLen).join("")
    // Handle CC -- spliceLength of 1 to catch the space
    if ( cc === "[br]" ) {
      ccRemoved.splice(this.state.charIndex,1,`<br/>`)
    }
    if ( cc === "[2br]" ) {
      ccRemoved.splice(this.state.charIndex,1,`<br/><br/>`)
    }
    if ( cc.charAt(1) === "w" & cc.charAt(2) !== "i" ) {
      let timeDelay = cc.replace(/[a-z[\]']*/g, "")
      await this.wait(timeDelay)
    }
    if ( cc.charAt(1) === "w" & cc.charAt(2) === "i" ) {
      this.waitInput = true;
      this.lockSpace = false;
    }
    // TODO: Remove project specific img parsing
    if ( cc === "[ding]") {
      let imgToAdd = `<img src="${DingImg}" alt="ding"/>`
      ccRemoved.splice(this.state.charIndex,1,imgToAdd)
    }
    if ( cc === "[reactjs]") {
      let domToAdd = `<img class="${localstyle.reactjs}" src="${ReactJSImg}" alt="reactjs"/>`
      ccRemoved.splice(this.state.charIndex,1,domToAdd)
    }
    if ( cc === "[email]") {
      let domToAdd = `<a href="mailto:adam@acatthatprograms.com?subject=We would totally love to hire you!">email me!</a>`
      ccRemoved.splice(this.state.charIndex,1,domToAdd)
    }
    if ( cc === "[website]") {
      let domToAdd = `<a href="https://acatthatprograms.com" target="_blank">website</a> `
      ccRemoved.splice(this.state.charIndex,1,domToAdd)
    }
    if ( cc === "[resume]") {
      let domToAdd = `<a href="https://acatthatprograms.com/curriculum_vitae.pdf" target="_blank">resume</a>`
      ccRemoved.splice(this.state.charIndex,1,domToAdd)
    }
    // Parse for custom control codes
    if (this.props.customCCs && this.props.customCCs.length > 0) {
      await this.parseForCustomCC(cc)
    }

    // Prepae setState Data to return
    return {
      "charArray" : ccRemoved,
      "charIndex" : this.state.charIndex, // Offset removal of '['
    }

  }

  // Parse props.customCCs array for custom codes, callback appropriate functions
  async parseForCustomCC(cc) {
    return new Promise( async (res) => {
      let customCC = this.props.customCCs.filter(e => e.signalChar === cc.charAt(1))
      // TODO: Add full match checking
      // Plan/theory out on how to support custom CC's with similar signal chars
      if (customCC.length !== 0) {
        if (customCC[0].async) {
          await customCC[0].codeFunction(this.removeBracketsFromCC(cc))
        } else {
          customCC[0].codeFunction(this.removeBracketsFromCC(cc))
        }
      }
      res();
    })
  }

  // Add waver to delay unless disabled to emulate natural text typing
  getCharDelay() {
    //return Math.floor( Math.random() * (this.medianCharDelay+this.delayWaver) + (this.medianCharDelay-this.delayWaver) )
    return Math.floor(Math.random() *
    ( ( (this.medianCharDelay+this.delayWaver) - (this.medianCharDelay-this.delayWaver) ) + 1 )
    + (this.medianCharDelay-this.delayWaver) ) * this.speedMulti;
  }

  // Remove surrounding brackets from CC
  removeBracketsFromCC(cc) {
    return cc.replace(/[[\]']*/g, "")
  }

  ///////////////
  /* Rendering */
  ///////////////

  renderAdvanceButton() {
    if (this.props.noPrompt) { return '' }
    if (
      (this.state.charsTyped.length >= this.state.charArray.length && !this.waitInput && this.state.charsTyped.length !== 0)
      || (this.waitInput)
    ) {
      return (
          <img src={SpacebarImg} alt="continue_img"/>
      )
    }
  }

  // Inject stringHTML elements from controlCodes
  getVisibleCharMarkup(html) {
    return{__html: html}
  }

  renderChars() {

    let lastChar = this.state.charsTyped.slice(this.state.charsTyped.length-1)
    // Hide DOM Elements
    if (typeof lastChar[0] !== 'undefined') {
      lastChar = lastChar[0].charAt(0) === "<" ? '' : lastChar
    }
    // Establish visible chars
    let visible = [...this.state.charsTyped]
    visible.pop() // Remove last word, as we'll add it seperately for animation
    let visibleText  = (<span key={"visibleChars"} className={localstyle.visibleChars} dangerouslySetInnerHTML={this.getVisibleCharMarkup(visible.join(''))}/>)
    let lastCharSpan = (<span key={"visibleChars lastChar"} className={localstyle.lastChar}>{lastChar}</span>)
    return [visibleText, lastCharSpan]
  }

  render() {

    return (

      <div className={localstyle.textbox}>
        <p>{this.renderChars()}</p>
        <div onClick={this.input.bind(this)} className={localstyle.spacebar}>
          {this.renderAdvanceButton()}
        </div>
        {/* Audio SFX*/}
        <audio ref={(sfx1) => { this.sfx1 = sfx1; }}>
          <source src={textBeep} type="audio/mpeg"></source>
        </audio>
      </div>

    )

  }

}

export default TextBox
