// React && Core Dependencies
import React, { useState, useEffect } from 'react';
import { mapAllStatesToProps, mapAllDispatchesToProps } from 'redux/helpers/main.js';
import { connect } from "react-redux";
// import { Link } from 'react-router-dom';

// Images
import page1Img from 'images/page1-1.png';
import page2Img from 'images/page1-2.png';
import page3Img from 'images/page1-3.png';

// Local Styling
import localstyle from './PageOne.module.scss';

// Components
import TextBox from 'components/TextBox/TextBox.jsx';

function PageOne(props) {

  let pageStates = [page1Img, page2Img, page3Img];
  let pageTimings = [400,800,800]
  let [pageState, setPageState] = useState(0)
  let [animOver, setAnimOver]   = useState(false)

  useEffect( () => {

    let animTimeout;

    if (!animOver) {
      animTimeout = setTimeout( () => {
        if (pageState < 2) {
          setPageState(pageState+1)
        } else {
          setAnimOver(true)
        }
      }, pageTimings[pageState])
    }

    if (animOver) {
      clearTimeout(animTimeout)
    }

  })

  function replay() {
    console.log('replay')
    setPageState(0)
    setAnimOver(false)
  }

  return (
    <div className="pageWrapColumn">

      <div className="pageBorder"/>

      <div className="page">
        <div className="bg_box"/>

        <div className="textWrapper">
          <TextBox/>
        </div>

        <div onClick={() => replay()} className="replay">Replay!</div>
        <img alt="current_page" className={localstyle.image} src={pageStates[pageState]}/>
      </div>

    </div>
  )

}


export default connect(mapAllStatesToProps, mapAllDispatchesToProps)(PageOne)
