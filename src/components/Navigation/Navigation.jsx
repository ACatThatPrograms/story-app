// React && Core Dependencies
import React from 'react';
// Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'

// Local Styling
import localstyle from './Navigation.module.scss';

function Navigation(props) {

  return (
    <div className={localstyle.navigationWrap}>
      {/* Back Arrow */}
      <div onClick={()=>props.turn('L', props)}>
        <FontAwesomeIcon icon={faArrowLeft}/>
      </div>
      {/* Location */}
      <div>Page {props.currentPage}</div>
      {/*Front Arrow */}
      <div onClick={()=>props.turn('R', props)}>
        <FontAwesomeIcon icon={faArrowRight}/>
      </div>

    </div>
  )

}


export default Navigation
