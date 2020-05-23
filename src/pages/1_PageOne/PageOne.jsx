// React && Core Dependencies
import React from 'react';
import { mapAllStatesToProps, mapAllDispatchesToProps } from 'redux/helpers/main.js';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';

// Images
import charHead from 'images/char_head.png';

// Local Styling
import localstyle from './PageOne.module.scss';

// This is a functional component written in ES6 syntax.
// Instead of a constructor props are passed as a function argument for functional components
const PageOne = (props) => {

  // Toggle base client_state.loading bool
  function toggleReduxStateTest() {
    props.dispatch_updateClient({'loading': !props.state_client.loading})
  }

  return (
    <div className="pageWrapColumn">

      {/* Local Style Example */}
      <div className={localstyle.page}>

        {/* Img Render Example - Don't forget your alt! */}
        <img alt="character_head_icon" height="44" width="44" src={charHead}/>
        <br/>

        {/* Global Style Example */}
        <p className="aGlobalClassOfRed">Page One</p>
        <br/>

        {/* Redux State Example */}
        <p>Redux State Test: {props.state_client.loading.toString()}</p>
        <button onClick={toggleReduxStateTest}>Toggle Redux State Test</button>
        <br/>


        {/* Link Example */}
        <Link to="/pageTwo">To Page Two!</Link>

      </div>

    </div>
  )

}


export default connect(mapAllStatesToProps, mapAllDispatchesToProps)(PageOne)
