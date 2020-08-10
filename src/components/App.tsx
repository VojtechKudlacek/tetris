import React, { FunctionComponent } from 'react';
import { Provider as StoreProvider } from 'overmind-react';
import Game from 'components/Game';
import store from 'store';

const App: FunctionComponent = () => {
	return (
		<StoreProvider value={store}>
			<main>
				<Game />
			</main>
		</StoreProvider>
	);
}

export default App;
