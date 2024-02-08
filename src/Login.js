import "./Login.css";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const Login = ({closeHandler}) => {
    return (
        <div className="Login-overlay">
        <div className="Login-content">
        <button onClick={closeHandler}>X</button>
        <Authenticator>
          {({ signOut, user }) => (
            <main>
              <h1>Hello {user.username}</h1>
              <button onClick={signOut}>Sign out</button>
            </main>
          )}
        </Authenticator>
        </div>
        </div>
      );
};

export default Login;