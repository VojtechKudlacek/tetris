import React, { FunctionComponent } from 'react';
import Game from 'components/Game';
import Store from 'store';

const App: FunctionComponent = () => {
	return (
		<Store>
			<main>
				<Game />
			</main>
		</Store>
	);
}

export default App;
