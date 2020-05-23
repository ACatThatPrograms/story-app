import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import './style/main.scss';

/* Major Components */
import Navigation from './components/Navigation/Navigation';

/* Pages */
import PageOne from 'pages/1_PageOne/PageOne';
import PageTwo from 'pages/2_PageTwo/PageTwo';

class App extends Component  {
  constructor(props){
    super(props)
    this.state = {}
  }

  render () {

    return (

      <Router>
        <Navigation/>
        <Route exact path="/" component={PageOne}/>
        <Route exact path="/pageTwo" component={PageTwo}/>
      </Router>

    );
  }
}

export default App;
