import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './components/Home/Home';
import Randomize from './components/Randomize/Randomize';
import Seed from './components/Seed/Seed';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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
          version: `${res.data.version}`
        })
        
      })
  }
  render() {
    return (
      <Router>
        <div className="App container-fluid">
            <Header />
            <div className="mb-4 page-container">
              <Routes>
                <Route exact path = "/" Component={Home} />
                <Route exact path = "/randomize" Component={Randomize} />
                <Route path = "/:game/:seed" Component={Seed} />
              </Routes>
            </div>
        </div>
      </Router>
    );
  }
}

export default App;
