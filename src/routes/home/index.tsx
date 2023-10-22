import { Component, h } from 'preact';
import style from './style.css';
import { DbCharacter, DbRowId, db } from '../../db';
import Loading from '../../components/loading';
import Profile from '../../components/profile';

interface Props {

}
interface State {
	characters: DbCharacter[];
}

export default class Home extends Component<Props, State> {
	needsCharacterList: boolean;

	constructor() {
		super();
		this.needsCharacterList = true;
	}
	fetchCharacters() {
		this.needsCharacterList = false;

		db.listCharacters(`owner.id="${db.ctx.authStore.model.id}"`).then((res) => {
			this.setState({
				characters: res.items
			})
		});
	}
	componentWillMount(): void {
		if (db.isLoggedIn() && this.needsCharacterList) {
			this.fetchCharacters();
		}
	}
	render() {
		let charactersDisplay: h.JSX.Element[];

		if (this.state.characters) {
			charactersDisplay = [];

			for (let ch of this.state.characters) {

				let chd = <Profile
					character={ch}
					isSelected={ch.id === db.selectedCharacterId}
					onSelect={(ch) => {
						db.selectedCharacterId = ch.id;

						//show the changed selection
						this.forceUpdate();

						console.log("Selected character", ch.name);
					}}
				></Profile>

				charactersDisplay.push(chd);
			}
		}

		return (
			<div class={style.home}>
				<img src="../../assets/icons/icon.svg" alt="Preact Logo" height="160" width="160" />
				<h1>Yarr</h1>

				{(db.isLoggedIn() &&
					<div>
						<h2>Select your character</h2>
						{(this.state.characters === undefined &&
							<div className={style.loading_container}>
								<Loading />
							</div>
						) || (
								<div className={style.charactersList}>
									{charactersDisplay}
								</div>
							)}
					</div>
				) ||
					<div>
						<h2>A free, and <a href="https://github.com/repcomm/yarr">open-source</a> MMO for the nostalgic</h2>

						Yarr is inspired by Kung Fu Panda World, Club Penguin, Panfu, among others
						<br /><br />
						Yarr uses the pocketbase database as a back-end,
						<br />
						and is a proof of concept
						for powering real-time gaming from a database.
					</div>
				}
			</div>
		);
	}
}
