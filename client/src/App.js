import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import axios from 'axios';
import Header from './components/Common/Header';
import Footer from './components/Common/Footer';
import Home from './components/Page/Home';
import Randomize from './components/Page/Randomize';
import Seed from './components/Page/Seed';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  constructor(){
    super();
    this.state = {
      version: "..."
    };
  }

  componentDidMount(){
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
        <Container fluid>
          <Header />
          <div className="mb-4 page-container">
            <Routes>
              <Route exact path = "/" Component={this.passVersion(Home)} />
              <Route exact path = "/randomize" Component={this.passVersion(Randomize)} />
              <Route path = "/:game/:seed" Component={Seed} />
            </Routes>
            <Footer version={this.state.version}/>
          </div>
        </Container>
      </Router>
    );
  }

  passVersion(Component) {
    const version = this.state.version;
    function ComponentWithProp(props) {
      return <Component
               {...props}
               version={version}
             />
    }
    return ComponentWithProp;
  }
}

export default App;
