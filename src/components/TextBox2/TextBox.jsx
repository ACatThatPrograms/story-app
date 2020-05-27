import React from 'react'
// import { mapAllStatesToProps, mapAllDispatchesToProps } from 'redux/helpers/main.js';
// import { connect } from "react-redux";

// Images
import SpacebarImg from 'images/spacebar1.gif';
//import ReactJSImg  from 'images/reactjs.png';
//import DingImg     from 'images/ding.png';
// Sfx
import textBeep from 'audio/text.mp3';

// Style
import localstyle from './TextBox.module.scss';

// BIG TODO: Fix other TODOs, extrapolate and make its own package

class TextBox extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      "charArray"  : [],    // Array of chars to type
      "charsTyped" : [],    // Initialize to array[] in prepareText()
      "charIndex"  : 0,     // Current char in charArray
    }

    this.speedMulti = 1;

    // Props
    this.medianCharDelay  = props.medianCharDelay || 40; //90;
    this.delayWaver       = props.delayWaver      || 30;
    this.startDelay       = props.startDelay      || 3000; // TODO: update this for not my needs

    // Timeout list
    this.parseTimeout = null;

    // Performance
    this.lastPerf   = 0;
    this.iterations = 0;
    this.perfStats  = {
      plus100s: 0,
      sub100s : 0,
    }

    // Non-React Temporary State - Use to prevent rendering
    this.waitInput = false
    this.timeouts  = []

  }

  /////////////////////////
  /* Mounting && Updates */
  /////////////////////////

  initialize() {}

  componentDidMount() {
    // this.initialize();
    // console.log("Mount!", this)
    // Subscribe Events
    // document.addEventListener("keydown", this.handleKeyDown.bind(this))
    // document.addEventListener("keyup", this.handleKeyUp.bind(this))
    // Prepare Text
    this.textToType = this.prepareText(this.props.textToType || "")
  }

  shouldComponentUpdate() {
    if (!this.state.charsTyped.length <= this.state.charArray.length) {
      //console.log(this.perfStats)
    }
    return this.state.charsTyped.length <= this.state.charArray.length
  }

  componentDidUpdate() {
    // Performance Logging
    let perf = performance.now() - this.lastPerf

    if (perf > 100) {
      this.perfStats.plus100s += 1
    } else {
      this.perfStats.sub100s += 1
    }

    this.lastPerf = performance.now()
    this.iterations += 1

    if (!this.waitInput) {
      this.sfx1.play()
      this.parseNextChar();
    }
  }

  componentWillUnmount() {
    this.clearTimeouts();
    // document.removeEventListener("keydown", this.handleKeyDown.bind(this))
    // document.removeEventListener("keyup", this.handleKeyUp.bind(this))
  }

  // Wait timeout for delays
  async wait(time) {
    return new Promise( (res) => {
      this.timeouts.push( setTimeout( () => {res()}, time) )
    })
  }

  async asyncSetState(stateToSet) {
    return new Promise( (res) => {
      this.setState(stateToSet, () => res() )
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

  async input() {
    // Response to waitInput
    if (this.waitInput) {
      await this.clearTimeouts()
      this.waitInput = false;
      this.forceUpdate();
    }
    else if (this.state.charsTyped.length >= this.state.charArray.length ) {
      this.props.turn()
    } else if (this.speedMulti !== .25){
      //this.speedMulti = .25
    }

  }

  ////////////////
  /* User Input */
  ////////////////
  handleKeyDown(e) {
    if (e.code === "Space") {
      this.input();
    }
  }

  handleKeyUp(e) {
    if (e.code === "Space") {
      //this.speedMulti = 1.00
    }
  }

  //////////////////
  /* Text Parsing */
  //////////////////

  async prepareText(text) {
    let charArray = text.split("")
    if (this.startDelay) { await this.wait(this.startDelay) }
    this.setState({"charArray": charArray}, this.parseNextChar)
  }

  // Parse the next char for CC Leaders, default is " [ " ; handle accordingly
  async parseNextChar() {

    let charDelay = this.getCharDelay()

    await this.wait(charDelay)

    // Check for injected React DOM element
    if (typeof this.state.charArray[this.state.charIndex] === 'object') {
      // Add domElement to typedChars
      let newcharArray = [...this.state.charsTyped]
      newcharArray.push(this.state.charArray[this.state.charIndex])
      this.setState({"charIndex": this.state.charIndex += 1, "charsTyped": newcharArray})
    }
    // Check for control codes
    else if (typeof this.state.charArray[this.state.charIndex] !== 'undefined'
            && this.state.charArray[this.state.charIndex].charAt(0) === '['
    ) {

      let ccDetected = await this.handleControlCode()
      await this.asyncSetState(ccDetected)

    } else {

      // Init an array to modify if no CCs
      let newcharArray = [...this.state.charsTyped]
      // Push new character to type
      newcharArray.push(this.state.charArray[this.state.charIndex])

      // If last character, add one last space to push last character where it belongs
      // This accounts for the css animation class for the entrance character
      // +1 to account for last char update not triggering rerender as per shouldComponentUpdate
      if (this.state.charsTyped.length === this.state.charArray.length) {
        newcharArray.push("X")
      }

      this.setState({"charIndex": this.state.charIndex += 1, "charsTyped": newcharArray})

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
      this.waitInput = true
    }
    // Prepae setState Data to return
    return {
      "charArray" : ccRemoved,
      "charIndex" : this.state.charIndex, // Offset removal of '['
    }

  }

  // Add waver to delay unless disabled to emulate natural text typing
  getCharDelay() {
    //return Math.floor( Math.random() * (this.medianCharDelay+this.delayWaver) + (this.medianCharDelay-this.delayWaver) )
    return Math.floor(Math.random() *
    ( ( (this.medianCharDelay+this.delayWaver) - (this.medianCharDelay-this.delayWaver) ) + 1 )
    + (this.medianCharDelay-this.delayWaver) );
  }

  ///////////////
  /* Rendering */
  ///////////////

  renderAdvanceButton() {
    if (
      (this.state.charsTyped.length >= this.state.charArray.length && !this.waitInput && this.state.charsTyped.length !== 0) ||
      (this.waitInput)
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
