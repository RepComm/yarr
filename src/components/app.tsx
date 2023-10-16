import { h } from 'preact';
import { Route, Router } from 'preact-router';

import Header from './header';

// Code-splitting is automated for `routes` directory
import Home from '../routes/home';
import Room from '../routes/room';
import Auth from '../routes/auth';
import { db } from '../db';
import Game from '../routes/game';

db.init();

const App = () => (
	<div id="app">
		<Header />
		<main>
			<Router>
				<Route path="/" component={Home} />
				<Route path="/play/:roomId?" component={Room} />
				<Route path="/auth" component={Auth} />
				<Route path="/game/:gameId" component={Game} />
			</Router>
		</main>
	</div>
);


export default App;
