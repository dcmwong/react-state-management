// @flow

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import './App.css';

import { Provider, Subscribe, Container } from 'unstated';

import fire from './fire';

type CounterState = {
  count: number
};
type MyTripState = {
  name: string
};


class CounterContainer extends Container<CounterState> {
  state = {
    count: 0
  };

  increment() {
    this.setState({ count: this.state.count + 1 });
  }

  decrement() {
    this.setState({ count: this.state.count - 1 });
  }
}

class TripContainer extends Container<MyTripState> {
  constructor() {
    super();
    this.state = {
      name: 'My Trip',
      messages: []
    }
    let messagesRef = fire.database().ref('messages').orderByKey().limitToLast(100);
    messagesRef.on('child_added', snapshot => {
      let message = { text: snapshot.val(), id: snapshot.key };
      this.setState({ messages: [message].concat(this.state.messages) });
    })
  }
  showModal() {
    this.setState({ show: !this.state.show });
  }
  set(name) {
    this.setState({ name: name });
  }
  pushToDb() {
    fire.database().ref('messages').push( this.state.name );
    console.log("saved");
  }
}

class TripNameModal extends Component {
  render() {
return (
    <Subscribe to={[TripContainer]}>
      {myTrip => (
      <div> 
        <button onClick={this.props.onClose}>Close</button> 
	  <input type="text" defaultValue={myTrip.state.name} onChange={e=>myTrip.set(e.target.value)} />
          <button onClick={() => {myTrip.pushToDb(); this.props.onClose}}>Save to database</button>
      </div>
     )}
    </Subscribe>
  )
}
}
class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.modalRoot = document.getElementById('modal-root');
    this.el = document.createElement('div');
  }

  componentDidMount() {
    this.modalRoot.appendChild(this.el);
  }

  componentWillUnmount() {
    this.modalRoot.removeChild(this.el);
  }

  render() {
    return this.props.show ? ReactDOM.createPortal(
      this.props.children,
      this.el,
    ) : null;
  }
}

function MyTrip() {
  return (
    <Subscribe to={[TripContainer]}>
      {myTrip => (
        <div>
	  <ul>
	    {myTrip.state.messages.map(x=><li key={x.id}>{x.text}</li>)}
	  </ul>
	  <input type="text" defaultValue={myTrip.state.name} onChange={e=>myTrip.set(e.target.value)} />
          <button onClick={() => myTrip.pushToDb()}>Save to database</button>
          <button onClick={() => myTrip.showModal()}>show</button>
	  <Modal show={myTrip.state.show}>
	    <TripNameModal onClose={()=>myTrip.showModal()} />
          </Modal>
        </div>
      )}
    </Subscribe>
  )
}


function Counter() {
  return (
    <Subscribe to={[CounterContainer]}>
      {counter => (
        <div>
          <button onClick={() => counter.decrement()}>-</button>
          <span>{counter.state.count}</span>
          <button onClick={() => counter.increment()}>+</button>
        </div>
      )}
    </Subscribe>
  );
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
	  <Provider>
	    <Counter />
	    <MyTrip />
	  </Provider>
       </div>
    );
  }
}

export default App;
