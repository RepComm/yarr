import { Component, h } from "preact";
import { db } from "../../db";
import style from "./style.css";
import { useRef } from "preact/hooks";
import { route } from "preact-router";

interface State {
  register?: boolean;
  issue?: any;
  help?: string;
}
interface Props {

}

function routeWithReload(to: string) {
  window.location.assign(to);
}

export default class Auth extends Component<Props, State> {
  constructor() {
    super();
  }
  render() {
    const usernameRef = useRef<HTMLInputElement>();
    const passwordRef = useRef<HTMLInputElement>();
    const confirmPasswordRef = useRef<HTMLInputElement>();

    return <div className={style.auth}>
      {(
        db.isLoggedIn() &&
        <div className={style.form}>
          You are logged in as {db.ctx.authStore.model.username}
          <br />
          <br />
          <button onClick={()=>{
            db.logout();
            setTimeout(()=>{
              routeWithReload("/");
            }, 50);
          }} className={style.submit}>Logout</button>
        </div>
      ) || (
          <div className={style.form}>
            You are not logged in,<br/>
            you can login or register below:
            <br/>
            <br/>
            <div className={style.field}>
              <span>Username:</span>
              <input type="username" ref={usernameRef}></input>
            </div>

            <div className={style.field}>
              <span>Password:</span>
              <input type="password" ref={passwordRef}></input>
            </div>

            <div className={style.field}>
              <span>Register?</span>
              <input type="checkbox" value="false"
                onChange={(evt) => {
                  const register = (evt.target as HTMLInputElement).checked;

                  this.setState({ register });
                }} />

            </div>

            <div className={style.field}>
              <span>Confirm password:</span>
              <input disabled={!this.state.register} type="password" ref={confirmPasswordRef} />
            </div>

            <button
              className={style.submit}
              onClick={()=>{

                this.setState({
                  issue: undefined,
                  help: undefined
                })

                const uname = usernameRef.current.value;
                const upass = passwordRef.current.value;
                const cpass = confirmPasswordRef.current.value;

                if (uname.trim().length < 1) {
                  this.setState({
                    issue: "username invalid",
                    help: "It seems you entered nothing, or just whitespace.."
                  });
                  return;
                }
                if (upass.trim().length < 1) {
                  this.setState({
                    issue: "password invalid",
                    help: "It seems you entered nothing, or just whitespace.."
                  });
                  return;
                }

                if (this.state.register) {
                  if (cpass !== upass) {
                    this.setState({
                      issue: "password does not match confirm password",
                      help: "I hate it when that happens"
                    });
                    return;
                  }

                  db.register(uname, upass, cpass ).then((rec)=>{
                    db.login(uname, upass).then((rec)=>{
                      setTimeout(()=>{
                        routeWithReload("/");
                      }, 50);
                    });
                  });
                } else {
                  db.login( uname, upass )
                  .then((rec)=>{
                    setTimeout(()=>{
                      routeWithReload("/");
                    }, 50);
                  }).catch((issue)=>{
                    const issueStr = issue.toString() as string;
  
                    const found400 = issueStr.includes("400");
                    const found404 = issueStr.includes("404");
  
                    if (found404) {
                      this.setState({
                        issue,
                        help: "404 -> database may not be reachable, are you offline?"
                      });
                    } else if (found400) {
                      this.setState({
                        issue,
                        help: "400 -> Credentials may not be correct"
                      });
                    } else {
                      this.setState({
                        issue,
                        help: "Not sure what this is.. Please contact devs at https://github.com/repcomm/yarr"
                      });
                    }
                  });
                }


            }}>{this.state.register ? "Register" : "Login"}</button>

            { this.state.issue &&
              <div className={style.issue}>
                <div className={style.issueLabel}>Issue:</div>
                {this.state.issue.toString()}
              </div>
            }
            { this.state.issue && this.state.help &&
              <div className={style.help}>
              <div className={style.helpLabel}>Help:</div>
              {this.state.help}</div>
            }
          </div>
        )
      }
    </div>;

  }
}
