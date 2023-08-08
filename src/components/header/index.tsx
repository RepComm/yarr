import { h } from 'preact';
import style from './style.css';
import { db } from '../../db';

const Header = () => (
	<header class={style.header}>
		<a href="/">
			<img className={style.logo} src="../../assets/logo.svg" alt="Icon" />
		</a>

		{(db.isLoggedIn() &&

			<div className={style.menu_items}>
				<a className={style.menu_item} href="/auth">
					Logout
				</a>
				<a className={style.menu_item} href="/play">
					Play
				</a>
			</div>

		) ||

			<div className={style.menu_items}>
				<a className={style.menu_item} href="/auth">
					Login / Register
				</a>
			</div>
		}
	</header>
);

export default Header;
