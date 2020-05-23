// React && Core Dependencies
import React from 'react';
import { mapAllStatesToProps, mapAllDispatchesToProps } from 'redux/helpers/main.js';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';

// Local Styling
import localstyle from './Navigation.module.scss';

const Navigation = (props) => {

  return (
    <div className={localstyle.navigationWrap}>

      {/* react-router-dom's Link component is easy, just use the to prop, and an a tag will be generated for you!*/}
      <Link to='/'>Page One (Root)</Link>
      <Link to='/pageTwo'>Page Two</Link>

    </div>
  )

}


export default connect(mapAllStatesToProps, mapAllDispatchesToProps)(Navigation)
