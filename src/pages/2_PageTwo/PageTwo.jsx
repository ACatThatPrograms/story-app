// React && Core Dependencies
import React from 'react';
import { mapAllStatesToProps, mapAllDispatchesToProps } from 'redux/helpers/main.js';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';

// Local Styling
import localstyle from './PageTwo.module.scss';

const PageTwo = (props) => {

  return (
    <div className="pageWrapColumn">

        <div className={localstyle.page}>
          <p>Page Two</p>
          <br/>
          <p>Notice the background color and padding, even though localstyle.page class is the same!</p>
          <br/>
          <Link to='/'>Back to page one!</Link>
        </div>

    </div>
  )

}


export default connect(mapAllStatesToProps, mapAllDispatchesToProps)(PageTwo)
