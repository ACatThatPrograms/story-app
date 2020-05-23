// React && Core Dependencies
import React from 'react';
import { mapAllStatesToProps, mapAllDispatchesToProps } from 'redux/helpers/main.js';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';

// Images
import charHead from 'images/char_head.png';

// Local Styling
import localstyle from './PageOne.module.scss';

const PageOne = (props) => {

  // Toggle base client_state.loading bool
  function toggleReduxStateTest() {
    props.dispatch_updateClient({'loading': !props.state_client.loading})
  }

  return (
    <div className="pageWrapColumn">

      <div className={localstyle.page}>
        <img alt="character_head_icon" height="44" width="44" src={charHead}/>
        <br/>
        <p className="aGlobalClassOfRed">Page One</p>
        <br/>
        <p>Redux State Test: {props.state_client.loading.toString()}</p>
        <button onClick={toggleReduxStateTest}>Toggle Redux State Test</button>
        <br/>
        <Link to="/pageTwo">To Page Two!</Link>
      </div>

    </div>
  )

}


export default connect(mapAllStatesToProps, mapAllDispatchesToProps)(PageOne)
