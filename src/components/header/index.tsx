import { h } from 'preact';
import { Link } from 'preact-router/match';
import style from './style.css';

const Header = () => (
	<header class={style.header}>
		<img className={style.logo} src="../../assets/logo.svg" alt="Icon" />
		<div className={style.menu_items}>
			<div
				className={style.menu_item}
				>
					Logout
			</div>
			<div
				className={style.menu_item}
				><a href="/play">
					Play
				</a>
			</div>
		</div>
	</header>
);

export default Header;
