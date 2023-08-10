import { h } from 'preact';
import { Route, Router } from 'preact-router';

import Header from './header';

// Code-splitting is automated for `routes` directory
import Home from '../routes/home';
import Room from '../routes/room';
import Auth from '../routes/auth';
import { db } from '../db';
import { Character } from 'src/routes/room/character';

db.init();

const App = () => (
	<div id="app">
		<Header />
		<main>
			<Router>
				<Route path="/" component={Home} />
				<Route path="/play/:roomId?" component={Room} />
				<Route path="/auth" component={Auth} />
			</Router>
		</main>
	</div>
);

export default App;
