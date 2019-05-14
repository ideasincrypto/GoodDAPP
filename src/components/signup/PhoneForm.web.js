// @flow
import React from 'react'
import PhoneInput from 'react-phone-number-input'
import './PhoneForm.css'

import { Description, Title, Wrapper } from './components'
import { userModelValidations } from '../../lib/gundb/UserModel'

type Props = {
  // callback to report to parent component
  doneCallback: ({ phone: string }) => null,
  screenProps: any,
  navigation: any
}

export type MobileRecord = {
  mobile: string,
  errorMessage?: string
}

type State = MobileRecord

export default class PhoneForm extends React.Component<Props, State> {
  state = {
    mobile: this.props.screenProps.data.mobile || '',
    errorMessage: ''
  }
  isValid = false

  handleChange = (mobile: string) => {
    if (this.state.errorMessage !== '') {
      this.setState({ errorMessage: '' })
    }

    this.setState({ mobile })
  }

  handleSubmit = () => {
    if (this.isValid) {
      this.props.screenProps.doneCallback({ mobile: this.state.mobile })
    }
  }

  handleEnter = (event: { nativeEvent: { key: string } }) => {
    if (event.keyCode === 13 && this.isValid) {
      this.handleSubmit()
    }
  }

  checkErrors = () => {
    const errorMessage = userModelValidations.mobile(this.state.mobile)
    this.setState({ errorMessage })
  }

  render() {
    const { errorMessage } = this.state
    this.isValid = userModelValidations.mobile(this.state.mobile) === ''
    const { key } = this.props.navigation.state

    return (
      <Wrapper valid={this.isValid} handleSubmit={this.handleSubmit}>
        <Title>{`${this.props.screenProps.data.fullName}, \n May we have your number please?`}</Title>

        <PhoneInput
          id={key + '_input'}
          value={this.state.mobile}
          onChange={this.handleChange}
          onBlur={this.checkErrors}
          error={errorMessage}
          onKeyDown={this.handleEnter}
        />
        <Description>We will shortly send you a verification code to this number</Description>
      </Wrapper>
    )
  }
}
