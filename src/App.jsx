import React, { Component } from 'react';
import { Progress } from 'reactstrap';
import './style/main.scss';
import { CSSTransitionGroup } from 'react-transition-group' // ES6
import { turnPage } from 'util/client.js'

/* Major Components */
import TextBox from 'components/TextBox2/TextBox.jsx';

// Nav for debugging
import Navigation from './components/Navigation/Navigation';

// Util
import { applyTextBoxAnim, getImageData } from 'util/client';
import narrative from 'util/narrative.js';

class App extends Component  {
  constructor(props){
    super(props)
    // Using local state and prop passing to
    // Allow react-transition animations
    this.state = {
      'currentPage'  : 0,
      'currentFrame' : 0,
      'loadedImages' : 0,
    }

    this.imageFrames    = getImageData();

    this.totalImages    = 22 // TODO: Automate this in utils

    this.getCurrentPage = this.getCurrentPage.bind(this)
    this.buildPage      = this.buildPage.bind(this)

  }

  ////////////////////////////////
  // Pafe Turn && State Updates //
  ////////////////////////////////
  turn(dir) {
    let makeshiftProps = {
      'state_client': {currentPage: this.state.currentPage},
      'dispatch_updateClient': this.pageUpdate.bind(this)
    }
    turnPage(dir, makeshiftProps)
  }

  pageUpdate(page) {
    this.setState({'currentPage': page.currentPage, 'currentFrame': 0})
  }

  ///////////////////
  // Page Building //
  ///////////////////
  buildPage() {
    return (
      <div className="page" key={"page_" + this.state.currentPage}>

        <div className="innerPage">

          {/*Non flipped page */}
          <div className="front"/>

          <div className="back">

            <div className={["left", this.getImgClass()].join(' ')}>
              <img alt="img" src={ this.getImageUrl() }/>
            </div>

            <div className="right">
              {applyTextBoxAnim(<TextBox turn={ () => {this.turn('R')} }  textToType={this.getCurrentNarrative()}/>)}
            </div>

          </div>

        </div>
        {this.state_currentPage}
      </div>
    )
  }

  getImgClass() {
    return "image " + "img_" + this.state.currentPage.toString()
  }

  getImageUrl() {
    return this.imageFrames[parseInt(this.state.currentPage)][parseInt(this.state.currentFrame)]
  }

  getCurrentPage() {
    return this.buildPage()
  }

  getCurrentNarrative() {
    return narrative[this.state.currentPage]
  }

  ////////////////
  // Loading Fx //
  ////////////////

  // Make sure images in
  getAllImages() {
    let images = []

    // Parse pages
    Object.keys(this.imageFrames).map( (k) => {
      // Parse Frames
      Object.keys(this.imageFrames[k]).map( (k2) => {
        let url = this.imageFrames[k][k2]
        images.push(<img key={url} src={url} alt={"scene_image"} onLoad={this.loadCounterUp.bind(this)} />)
        return ''
      })
      return ''
    })

    return images

  }

  loadCounterUp() {
    this.setState({"loadedImages": this.state.loadedImages + 1});
  }

  /////////////////
  /* MAIN RENDER */
  /////////////////

  render () {

    let nav  = <Navigation currentPage={this.state.currentPage} turn={this.turn.bind(this)}/>
    let page = this.getCurrentPage()

    let cssTransiitonProps = {
      transitionName          : "page",
      // transitionAppear        : true,
      // transitionAppearTimeout : 1500,
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
