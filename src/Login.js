import "./Login.css";
import { Authenticator, Button } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const Login = ({closeHandler}) => {
    return (
        <div className="Login-overlay">
        <div className="Login-content">
        <Button onClick={closeHandler}>X</Button>
        <Authenticator>
          {({ signOut, user }) => (
            closeHandler()
          )}
        </Authenticator>
        </div>
        </div>
      );
};

export default Login;