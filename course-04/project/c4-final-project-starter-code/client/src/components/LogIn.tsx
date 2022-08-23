import * as React from 'react'
import Auth from '../auth/Auth'
import { Button, Container, Icon, Header } from 'semantic-ui-react'

interface LogInProps {
  auth: Auth
}

interface LogInState { }

export class LogIn extends React.PureComponent<LogInProps, LogInState> {
  onLogin = () => {
    this.props.auth.login()
  }

  render() {
    return (
      <div>
        <Container text>
          <h1>Please log in to create a new task!</h1>

          <Button onClick={this.onLogin} size="huge" color="olive">
            Log in
            <Icon name='arrow right' />
          </Button>
        </Container>
      </div>
    )
  }
}
