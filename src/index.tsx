import React from 'react';
import ReactDOM from 'react-dom';
import App from 'components/App';
import { unregister } from 'services/workers';

ReactDOM.render(<App />, document.getElementById('root'));

unregister();
