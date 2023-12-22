import React, { Component } from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './components/Home/Home';
import Randomize from './components/Randomize/Randomize';
import Seed from './components/Seed/Seed';
import './App.css';

class App extends Component {
  constructor(){
    super();
    this.state = {
      version: "v "
    };
  }

  componentWillMount(){
    axios.get('/api/version')
      .then(res => {
        this.setState({
          version: `v${res.data.version}`
        })
        
      })
  }
  render() {
    return (
      <Router>
        <div className="App container-fluid">
            <Header />
            <div className="mb-4 page-container">
              <Route exact path = "/" component={Home} />
              <Route exact path = "/randomize" component={Randomize} />
              <Route path = "/:game/:seed" component={Seed} />
            </div>
            <Footer version={this.state.version}/>
        </div>
      </Router>
    );
  }
}

export default App;
