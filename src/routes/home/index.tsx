import { h } from 'preact';
import style from './style.css';

const Home = () => {
	return (
		<div class={style.home}>
			<img src="../../assets/icons/icon.svg" alt="Preact Logo" height="160" width="160" />
			<h1>Yarr</h1>
			<h2>A free, and <a href="https://github.com/repcomm/yarr">open-source</a> MMO for the nostalgic</h2>
			
			Yarr is inspired by Kung Fu Panda World, Club Penguin, Panfu, among others
			<br /><br />
			Yarr uses the pocketbase database as a back-end,
			<br/>
			and is a proof of concept
			for powering real-time gaming from a database.
		</div>
	);
};

export default Home;
