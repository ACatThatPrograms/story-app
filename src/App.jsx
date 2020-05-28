import React, { Component } from 'react';
import { Progress, Spinner } from 'reactstrap';
import './style/main.scss';
import { CSSTransitionGroup } from 'react-transition-group' // ES6
import { turnPage } from 'util/client.js'

/* Major Components */
import TextBox from 'components/TextBox2/TextBox.jsx';

// Nav for debugging
// import Navigation from './components/Navigation/Navigation';

// Util
import { applyTextBoxAnim, getImageData, getPageAnimType } from 'util/client';
import narrative from 'util/narrative.js';

class App extends Component  {
  constructor(props){
    super(props)

    this.state = {
      'currentPage'  : 0,
      'currentFrame' : 0,
      'loadedImages' : 0,
    }

    this.imageFrames    = getImageData(); // All Image Frames
    this.totalImages    = 22; // TODO: Automate this in utils
    this.loopAnimRate   = 700;

    // Binds
    this.getCurrentPage = this.getCurrentPage.bind(this)
    this.buildPage      = this.buildPage.bind(this)
    this.checkAnim      = this.checkAnim.bind(this)

    // Timeouts
    this.loopInterval = null

    // TextBox Props to Forward Custom CCs
    this.customCCs = [
      {
        'signalChar'   : 'f',    // First character of code
        'fullMatch'    : false,  // Look for full match? Use for CCs without vars
        'codeFunction' : this.parseForFrameUpdate.bind(this), // Callback Fx for parse
        'async'        : false   // Defaults to false
      }
    ]

  }

  componentDidUpdate() {
    //console.log(this.state)
  }

  ////////////////////////
  // Animation Handling //
  ////////////////////////
  checkAnim() {
    clearInterval(this.loopInterval)
    if (getPageAnimType(this.state.currentPage) === 'loop') {
      this.handleLoopAnim()
    }
  }

  handleLoopAnim() {
    let frameUrls  = this.imageFrames[this.state.currentPage]
    let frames = Object.keys(frameUrls)
    this.loopInterval = setInterval( () => {
      if (this.state.currentFrame < frames.length-1) { // Next Frame
        this.setState({'currentFrame': this.state.currentFrame+1})
      } else {
        this.setState({'currentFrame': 0}) // Reset Anim
      }
    }, this.loopAnimRate)
  }

  triggerAnim(frame) {
    this.setState({"currentFrame": frame})
  }

  ///////////////////////////////////
  // Custom Control Codes for TBox //
  ///////////////////////////////////
  parseForFrameUpdate(cc) {
    let updateFrame = parseInt(cc.charAt(1));
    this.triggerAnim(updateFrame)
  }

  ////////////////////////////////
  // Pafe Turn && State Updates //
  ////////////////////////////////
  turn(dir) {
    turnPage(dir, this.state.currentPage, this.pageUpdate.bind(this))
  }

  pageUpdate(page) {
    this.setState({'currentPage': page.currentPage, 'currentFrame': 0}, this.checkAnim)
  }

  // Show first spinner on textbox loading
  firstSpinner() {
    return this.state.currentPage === 0 ? (
      <div className="spinner"><Spinner style={{"height":"6rem","width":"6rem"}} color="success"/></div>
    ) : ''
  }

  ///////////////////
  // Page Building //
  ///////////////////
  buildPage() {

    let textBox = (applyTextBoxAnim(
        <TextBox
          customCCs={this.customCCs}
          textToType={this.getCurrentNarrative()}
          turn={ () => {this.turn('R')} }
          noPrompt={this.state.currentPage === 10 ? true : false}
        />
      )
    )

    return (
      <div className="page" key={"page_" + this.state.currentPage}>
        <div className="innerPage">

          <div className="front"/>
          <div className="back">

            <div className={["left", this.getImgClass()].join(' ')}>
              {this.getImage()}
              {this.checkForNonImage()}
            </div>

            <div className="right">
              {textBox}
              {this.firstSpinner()}
            </div>

          </div>
        </div>
      </div>
    )
  }

  getImgClass() {
    return "image img_" + this.state.currentPage.toString()
  }

  getImage() {
    let url = this.imageFrames[parseInt(this.state.currentPage)][parseInt(this.state.currentFrame)]
    return  url === null ? '' : (<img alt="img" src={url}/>)
  }

  getCurrentPage() {
    return this.buildPage()
  }

  getCurrentNarrative() {
    return narrative[this.state.currentPage]
  }

  // Return secondary left panel material
  checkForNonImage() {
    return ''
  }

  ////////////////
  // Loading Fx //
  ////////////////

  // Return all images as img React Objects in array
  getAllImages() {
    let images = []
    Object.keys(this.imageFrames).map( (k) => {
      Object.keys(this.imageFrames[k]).map( (k2) => {
        let url = this.imageFrames[k][k2]
        images.push(<img key={url} src={url} alt={"scene_image"} onLoad={this.loadCounterUp.bind(this)} />)
        return ''
      })
      return ''
    })
    // TODO  Filter out nulls to remove key errors
    return images
  }

  loadCounterUp() {
    this.setState({"loadedImages": this.state.loadedImages + 1});
  }

  /////////////////
  /* MAIN RENDER */
  /////////////////

  render () {

    let nav  = '' // <Navigation currentPage={this.state.currentPage} turn={this.turn.bind(this)}/>
    let page = this.getCurrentPage()

    let cssTransiitonProps = {
      transitionName          : "page",
      transitionEnter         : true,
      transitionLeave         : true,
      transitionEnterTimeout  : 3000,
      transitionLeaveTimeout  : 2000,
    }

    ///////////////////
    /* LOADER RENDER */
    ///////////////////

    if (this.state.loadedImages < this.totalImages) {
      return (
        <div className="loaderWrap">
          <div>Please wait!</div>
          <div>{this.state.loadedImages} / {this.totalImages} Frames Loaded</div>
          <div className="loader">
            <Progress value={this.state.loadedImages} max={this.totalImages} />
          </div>
          <div className="image_queue">
            {this.getAllImages()}
          </div>
        </div>
      )
    }

    //////////////////
    /* STORY RENDER */
    //////////////////

    return (

      <>

        {nav}

        <div className="main-border">

          <div className="page-color"/>

          <CSSTransitionGroup {...cssTransiitonProps}>
            {page}
          </CSSTransitionGroup>

        </div>

      </>

    );

  }
}

export default App;
