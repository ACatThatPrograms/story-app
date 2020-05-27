import React from 'react';
import { CSSTransitionGroup } from 'react-transition-group' // ES6

// Story Images
import page1_1 from 'images/page1-1.png';
import page1_2 from 'images/page1-2.png';
import page1_3 from 'images/page1-3.png';
import page1_4 from 'images/page1-4.png';
import page2_1 from 'images/page2-1.png';
import page2_2 from 'images/page2-2.png';
import page3_1 from 'images/page3.png';
import page4_1 from 'images/page4-1.png';
import page4_2 from 'images/page4-2.png';
import page5_1 from 'images/page5-1.png';
import page5_2 from 'images/page5-2.png';
import page6_1 from 'images/page6-1.png';
import page6_2 from 'images/page6-2.png';
import page6_3 from 'images/page6-3.png';
import page7_1 from 'images/page7-1.png';
import page7_2 from 'images/page7-2.png';
import page7_3 from 'images/page7-3.png';
import page7_4 from 'images/page7-4.png';
import page8_1 from 'images/page8-1.png';
import page8_2 from 'images/page8-2.png';
import page8_3 from 'images/page8-3.png';
import page8_4 from 'images/page8-4.png';

////////////////////////
// Animation Builders //
////////////////////////

// TODO pubsub to width change to update this

const animTimeout = document.getElementsByTagName('html')[0].clientWidth > 640 ? 5000 : 5000

export function applyTextBoxAnim(component) {
  return (
    <CSSTransitionGroup
      transitionName="textbox"
      transitionAppear={true}
      transitionAppearTimeout={animTimeout}
      transitionEnter={true}
      transitionLeave={true}
      transitionEnterTimeout={0}
      transitionLeaveTimeout={0}
    >
      {component}
    </CSSTransitionGroup>
  )
}

////////////
/* Images */
////////////

// Return images relative to page as well as data and frames with imgData for each
export function getImageData() {
  return {
      0: {
        0: null
      },
      1: {
        0: page1_1,
        1: page1_2,
        2: page1_3,
        3: page1_4,
      },

      2: {
        0: page2_1,
        1: page2_2,
      },

      3: {
        0: page3_1,
      },

      4: {
        0: page4_1,
        1: page4_2,
      },

      5: {
        0: page5_1,
        1: page5_2,
      },

      6: {
        0: page6_1,
        1: page6_2,
        2: page6_3,
      },

      7: {
        0: page7_1,
        1: page7_2,
        2: page7_3,
        3: page7_4,
      },

      8: {
        0: page8_1,
        1: page8_2,
        2: page8_3,
        3: page8_4,
      },

    }
}

//////////////////
/* Page Turning */
//////////////////

// TODO: Refactor these for post-redux removal

export function turnPage(dir, reduxProps) {
    let currentPage = reduxProps.state_client.currentPage;
    let dispatchFx  = reduxProps.dispatch_updateClient;

    switch(dir) {
      case 'L': _turnLeft(currentPage, dispatchFx); break;
      case 'R': _turnRight(currentPage, dispatchFx); break;
      default : throw new Error("turnPage() called with", dir, `expected 'R' or 'L'`, )
    }
}

const _turnLeft = (currentPage, dispatchFx) => {
  if (currentPage > 0) { dispatchFx({'currentPage':currentPage-1}) }
}

const _turnRight = (currentPage, dispatchFx) => {
  if (currentPage < 7) { dispatchFx({'currentPage':currentPage+1}) }
}
