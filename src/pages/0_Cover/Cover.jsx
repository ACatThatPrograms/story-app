// React && Core Dependencies
import React, { useState, useEffect } from 'react';
import { mapAllStatesToProps, mapAllDispatchesToProps } from 'redux/helpers/main.js';
import { connect } from "react-redux";

// Components
import TextBox from 'components/TextBox/TextBox.jsx';

let narrativeCommandText =
`Now, [w200] here’s a tale worthy enough for the bedtimes of all young software engineers around the world [w100] . [w100] . [w100] . [w250]
~ This is the story of Adam, [w600] and how he got the best job ever.`

function Cover(props) {

  return(

    <div className="pageWrapColumn">

      <div className="pageBorder"/>

      <div className="page">

        <div className="fullPanel">

            <TextBox textToType={narrativeCommandText}/>

        </div>

      </div>

    </div>

  )

}

export default connect(mapAllStatesToProps, mapAllDispatchesToProps)(Cover)
